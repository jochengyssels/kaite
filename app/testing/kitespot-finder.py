import os
import re
import json
import time
import logging
import random
import asyncio
import pandas as pd
from typing import List, Dict, Set, Any
from urllib.parse import urlparse, urljoin
import httpx
from bs4 import BeautifulSoup
from geopy.geocoders import Nominatim
from geopy.exc import GeocoderTimedOut, GeocoderServiceError
import nltk
from nltk.tokenize import sent_tokenize
import warnings

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("kitespot_crawler.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("kitespot_crawler")

# Suppress specific warnings
warnings.filterwarnings("ignore", category=UserWarning, module='bs4')

# Download necessary NLTK data
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')

class KitespotCrawler:
    def __init__(self):
        self.starting_urls = [
            "https://globalkitespots.com/global-kitesurf-spots-and-regions/",
            "https://www.kitesurfingholidays.com/kitesurf-spots",
            "https://www.kiteboardingnomad.com/kitesurf-spots",
            "https://kitesurfculture.com/kitesurf-spots/",
            "https://www.thekitespot.com/"
        ]
        self.visited_urls: Set[str] = set()
        self.queue_urls: Set[str] = set(self.starting_urls)
        self.kitespots: List[Dict[str, Any]] = []
        self.kitespot_keywords = [
            "kitesurf", "kitesurfing", "kite spot", "kitespot", 
            "kiteboarding", "kite boarding", "kite surf"
        ]
        self.country_keywords = set([
            "afghanistan", "albania", "algeria", "andorra", "angola", "antigua", "argentina", 
            "armenia", "australia", "austria", "azerbaijan", "bahamas", "bahrain", "bangladesh", 
            "barbados", "belarus", "belgium", "belize", "benin", "bhutan", "bolivia", "bosnia", 
            "botswana", "brazil", "brunei", "bulgaria", "burkina faso", "burundi", "cambodia", 
            "cameroon", "canada", "cape verde", "central african republic", "chad", "chile", 
            "china", "colombia", "comoros", "congo", "costa rica", "croatia", "cuba", "cyprus", 
            "czech republic", "denmark", "djibouti", "dominica", "dominican republic", "east timor", 
            "ecuador", "egypt", "el salvador", "equatorial guinea", "eritrea", "estonia", "eswatini", 
            "ethiopia", "fiji", "finland", "france", "gabon", "gambia", "georgia", "germany", 
            "ghana", "greece", "grenada", "guatemala", "guinea", "guinea-bissau", "guyana", "haiti", 
            "honduras", "hungary", "iceland", "india", "indonesia", "iran", "iraq", "ireland", 
            "israel", "italy", "jamaica", "japan", "jordan", "kazakhstan", "kenya", "kiribati", 
            "korea", "kosovo", "kuwait", "kyrgyzstan", "laos", "latvia", "lebanon", "lesotho", 
            "liberia", "libya", "liechtenstein", "lithuania", "luxembourg", "madagascar", "malawi", 
            "malaysia", "maldives", "mali", "malta", "marshall islands", "mauritania", "mauritius", 
            "mexico", "micronesia", "moldova", "monaco", "mongolia", "montenegro", "morocco", 
            "mozambique", "myanmar", "namibia", "nauru", "nepal", "netherlands", "new zealand", 
            "nicaragua", "niger", "nigeria", "north macedonia", "norway", "oman", "pakistan", 
            "palau", "palestine", "panama", "papua new guinea", "paraguay", "peru", "philippines", 
            "poland", "portugal", "qatar", "romania", "russia", "rwanda", "saint kitts", "saint lucia", 
            "saint vincent", "samoa", "san marino", "sao tome", "saudi arabia", "senegal", "serbia", 
            "seychelles", "sierra leone", "singapore", "slovakia", "slovenia", "solomon islands", 
            "somalia", "south africa", "south sudan", "spain", "sri lanka", "sudan", "suriname", 
            "sweden", "switzerland", "syria", "taiwan", "tajikistan", "tanzania", "thailand", 
            "togo", "tonga", "trinidad", "tunisia", "turkey", "turkmenistan", "tuvalu", "uganda", 
            "ukraine", "united arab emirates", "united kingdom", "usa", "united states", "america", 
            "uruguay", "uzbekistan", "vanuatu", "vatican city", "venezuela", "vietnam", "yemen", 
            "zambia", "zimbabwe"
        ])
        self.geocoder = Nominatim(user_agent="kitespot_crawler")
        self.max_crawl_depth = 3
        self.spot_analysis_threshold = 0.4
        self.client = httpx.AsyncClient(
            timeout=30.0,
            follow_redirects=True,
            headers={
                "User-Agent": "KitespotCrawler/1.0 (research project; contact: kitespotmap@example.com)"
            }
        )

    async def start_crawling(self, max_spots=1000, max_urls=5000):
        """Start the crawling process"""
        logger.info(f"Starting crawl with {len(self.starting_urls)} seed URLs")
        crawled_count = 0
        
        while self.queue_urls and len(self.kitespots) < max_spots and crawled_count < max_urls:
            # Get a batch of URLs to process concurrently
            batch_size = 10
            batch_urls = list(self.queue_urls)[:batch_size]
            self.queue_urls = self.queue_urls - set(batch_urls)
            
            # Process the batch concurrently
            tasks = [self.process_url(url) for url in batch_urls]
            await asyncio.gather(*tasks)
            
            crawled_count += len(batch_urls)
            
            # Progress report
            logger.info(f"Crawled {crawled_count} URLs, found {len(self.kitespots)} kite spots, {len(self.queue_urls)} URLs in queue")
            
            # Introduce a small delay to be respectful
            await asyncio.sleep(1)
        
        logger.info(f"Crawl complete. Found {len(self.kitespots)} kitesurfing spots.")
        return self.kitespots

    async def process_url(self, url, depth=0):
        """Process a single URL, looking for kitesurfing spots and new links"""
        if url in self.visited_urls or depth > self.max_crawl_depth:
            return
        
        self.visited_urls.add(url)
        
        try:
            # Fetch the page
            logger.debug(f"Fetching: {url}")
            response = await self.client.get(url)
            response.raise_for_status()
            
            # Skip non-HTML content
            content_type = response.headers.get('content-type', '')
            if 'text/html' not in content_type.lower():
                return
            
            # Parse the HTML
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Check if this is potentially a kitespot page
            is_kitespot_related = False
            for keyword in self.kitespot_keywords:
                if keyword.lower() in url.lower() or keyword.lower() in soup.text.lower():
                    is_kitespot_related = True
                    break
            
            if is_kitespot_related:
                # This page mentions kitesurfing, analyze it for spots
                await self.extract_kitespot_info(soup, url)
            
            # Extract links from the page to continue crawling
            if depth < self.max_crawl_depth:
                links = soup.find_all('a', href=True)
                for link in links:
                    href = link['href']
                    
                    # Handle relative URLs
                    if not href.startswith(('http://', 'https://')):
                        href = urljoin(url, href)
                    
                    # Basic URL filtering (skip social media, file downloads, etc.)
                    parsed_url = urlparse(href)
                    if not parsed_url.netloc:
                        continue
                    
                    if (
                        href not in self.visited_urls and
                        href not in self.queue_urls and
                        ".pdf" not in href.lower() and
                        ".jpg" not in href.lower() and
                        ".png" not in href.lower() and
                        "facebook.com" not in href.lower() and
                        "twitter.com" not in href.lower() and
                        "instagram.com" not in href.lower() and
                        "youtube.com" not in href.lower() and
                        "linkedin.com" not in href.lower() and
                        # Prioritize URLs that mention kitesurfing
                        any(keyword in href.lower() for keyword in self.kitespot_keywords)
                    ):
                        self.queue_urls.add(href)
        
        except httpx.HTTPStatusError as e:
            logger.warning(f"HTTP error for {url}: {e}")
        except httpx.RequestError as e:
            logger.warning(f"Request error for {url}: {e}")
        except Exception as e:
            logger.error(f"Error processing {url}: {e}")

    async def extract_kitespot_info(self, soup, url):
        """Extract kitesurfing spot information from the page"""
        # Extract the page title
        title = soup.title.string if soup.title else ""
        
        # Extract the main content text for analysis
        main_content = ""
        
        # Try common content container selectors
        content_selectors = [
            "main", "article", ".content", "#content", ".main", "#main", 
            ".post", ".entry", ".page-content", "section"
        ]
        
        for selector in content_selectors:
            content_element = soup.select_one(selector)
            if content_element:
                main_content = content_element.get_text(separator=' ', strip=True)
                break
        
        # If no content found via selectors, use the whole body
        if not main_content:
            main_content = soup.body.get_text(separator=' ', strip=True) if soup.body else ""
        
        # Split into sentences for analysis
        sentences = sent_tokenize(main_content)
        
        # Look for sentences that mention both kitesurfing and geographic locations
        potential_spot_sentences = []
        
        for sentence in sentences:
            sentence_lower = sentence.lower()
            has_kite_keyword = any(keyword in sentence_lower for keyword in self.kitespot_keywords)
            has_country_keyword = any(country in sentence_lower for country in self.country_keywords)
            
            if has_kite_keyword and has_country_keyword:
                potential_spot_sentences.append(sentence)
        
        # If we found potential spot information, try to extract structured data
        if potential_spot_sentences:
            # Simple extraction heuristic
            spot_name = self.extract_spot_name(title, potential_spot_sentences)
            country = self.extract_country(potential_spot_sentences)
            region = self.extract_region(potential_spot_sentences, country)
            
            # Check if we have enough data to consider this a valid spot
            if spot_name and country:
                # Check if this spot already exists in our collection
                if not any(spot['name'].lower() == spot_name.lower() and 
                           spot['country'].lower() == country.lower() for spot in self.kitespots):
                    
                    # Get coordinates using location name
                    lat, lng = await self.get_coordinates(f"{spot_name}, {region}, {country}")
                    
                    # Extract other details
                    wind_info = self.extract_wind_info(main_content)
                    water_info = self.extract_water_info(main_content)
                    best_season = self.extract_season_info(main_content)
                    
                    # Create the kitespot entry
                    kitespot = {
                        "name": spot_name,
                        "country": country,
                        "region": region,
                        "latitude": lat,
                        "longitude": lng,
                        "wind_direction": wind_info.get("direction"),
                        "avg_wind_speed": wind_info.get("speed"),
                        "water_type": water_info.get("type"),
                        "water_condition": water_info.get("condition"),
                        "best_season": best_season,
                        "source": url,
                        "source_type": "web-crawler"
                    }
                    
                    self.kitespots.append(kitespot)
                    logger.info(f"Found new kitespot: {spot_name}, {country}")

    def extract_spot_name(self, title, sentences):
        """Extract the kitesurfing spot name from the page"""
        # Try to extract from title first
        title_lower = title.lower()
        if any(keyword in title_lower for keyword in self.kitespot_keywords):
            # Remove common prefixes/suffixes to isolate the spot name
            name_patterns = [
                r"(.+) - .* kitesurfing",
                r"(.+) kitesurf(ing)? spot",
                r"kitesurf(ing)? (in|at) (.+)",
                r"(.+) - kite spot"
            ]
            
            for pattern in name_patterns:
                match = re.search(pattern, title_lower)
                if match:
                    group = match.group(1) if pattern.startswith("(.+)") else match.group(3)
                    return group.strip().title()
        
        # If title doesn't work, try to extract from the first relevant sentence
        for sentence in sentences:
            sentence_lower = sentence.lower()
            for keyword in self.kitespot_keywords:
                if keyword in sentence_lower:
                    idx = sentence_lower.find(keyword)
                    
                    # Look for the spot name before the keyword
                    if idx > 10:  # Ensure there's enough text before the keyword
                        pre_text = sentence_lower[:idx].strip()
                        words = pre_text.split()
                        if len(words) >= 2:
                            return " ".join(words[-2:]).title()
                    
                    # Look for the spot name after "in" or "at" following the keyword
                    after_text = sentence_lower[idx + len(keyword):]
                    match = re.search(r"(in|at) ([^,.]+)", after_text)
                    if match:
                        return match.group(2).strip().title()
        
        # Fallback: use the page title if it's not too long
        if 3 <= len(title.split()) <= 7:
            return title.strip()
        
        return None

    def extract_country(self, sentences):
        """Extract the country from the content"""
        for sentence in sentences:
            sentence_lower = sentence.lower()
            for country in self.country_keywords:
                if country in sentence_lower:
                    return country.title()
        return None

    def extract_region(self, sentences, country):
        """Extract the region/city information"""
        if not country:
            return None
            
        country_lower = country.lower()
        
        for sentence in sentences:
            sentence_lower = sentence.lower()
            if country_lower in sentence_lower:
                # Look for text between common separators and the country
                separators = [',', 'in', 'near', 'at']
                
                for separator in separators:
                    pattern = f"{separator} ([^,]+), {country_lower}"
                    match = re.search(pattern, sentence_lower)
                    if match:
                        return match.group(1).strip().title()
        
        return None

    def extract_wind_info(self, content):
        """Extract wind information from the page content"""
        wind_info = {}
        
        # Wind direction
        direction_pattern = r"wind (direction|directions).{1,30}(north|south|east|west|northeast|northwest|southeast|southwest|N|S|E|W|NE|NW|SE|SW)"
        direction_match = re.search(direction_pattern, content.lower())
        if direction_match:
            wind_info["direction"] = direction_match.group(2).upper()
        
        # Wind speed
        speed_pattern = r"(average|avg).{1,20}wind.{1,20}(\d+)[^\d]*(knots|kts|kn|mph|km/h)"
        speed_match = re.search(speed_pattern, content.lower())
        if speed_match:
            try:
                speed = float(speed_match.group(2))
                wind_info["speed"] = speed
            except ValueError:
                pass
        
        return wind_info

    def extract_water_info(self, content):
        """Extract water information from the page content"""
        water_info = {}
        
        # Water type
        type_pattern = r"(sea|ocean|lake|lagoon|flat water|flatwater|chop|choppy|waves|reef)"
        type_match = re.search(type_pattern, content.lower())
        if type_match:
            water_info["type"] = type_match.group(1).title()
        
        # Water conditions
        condition_pattern = r"(flat|choppy|wavy|shallow|deep|reef|waves)"
        condition_match = re.search(condition_pattern, content.lower())
        if condition_match:
            water_info["condition"] = condition_match.group(1).title()
        
        return water_info

    def extract_season_info(self, content):
        """Extract the best season information"""
        seasons = ["spring", "summer", "fall", "autumn", "winter"]
        months = ["january", "february", "march", "april", "may", "june", 
                  "july", "august", "september", "october", "november", "december"]
        
        # Look for season mentions
        season_pattern = r"best (time|season).{1,30}(spring|summer|fall|autumn|winter)"
        season_match = re.search(season_pattern, content.lower())
        if season_match:
            return season_match.group(2).title()
        
        # Look for month mentions
        month_pattern = r"best (time|season|months).{1,50}(january|february|march|april|may|june|july|august|september|october|november|december).{1,20}(january|february|march|april|may|june|july|august|september|october|november|december)?"
        month_match = re.search(month_pattern, content.lower())
        if month_match:
            start_month = month_match.group(2).title()
            end_month = month_match.group(3).title() if month_match.group(3) else None
            
            if end_month:
                return f"{start_month} to {end_month}"
            else:
                return start_month
        
        return None

    async def get_coordinates(self, location_name):
        """Get latitude and longitude for a location using geopy"""
        try:
            # Add a small delay to respect geocoding service rate limits
            await asyncio.sleep(1)
            
            location = self.geocoder.geocode(location_name)
            if location:
                return location.latitude, location.longitude
        except (GeocoderTimedOut, GeocoderServiceError) as e:
            logger.warning(f"Geocoding error for {location_name}: {e}")
        except Exception as e:
            logger.error(f"Error getting coordinates for {location_name}: {e}")
        
        return None, None

    def save_to_json(self, filename="kitespots.json"):
        """Save the collected kitespots to a JSON file"""
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(self.kitespots, f, indent=2, ensure_ascii=False)
        logger.info(f"Saved {len(self.kitespots)} kitespots to {filename}")

    def save_to_csv(self, filename="kitespots.csv"):
        """Save the collected kitespots to a CSV file"""
        df = pd.DataFrame(self.kitespots)
        df.to_csv(filename, index=False, encoding='utf-8')
        logger.info(f"Saved {len(self.kitespots)} kitespots to {filename}")

async def main():
    # Create and run the crawler
    crawler = KitespotCrawler()
    spots = await crawler.start_crawling(max_spots=500, max_urls=1000)
    
    # Save the results
    crawler.save_to_json()
    crawler.save_to_csv()
    
    # Print summary
    print(f"\nCrawl complete! Found {len(spots)} kitesurfing spots.")
    print(f"Results saved to kitespots.json and kitespots.csv")

if __name__ == "__main__":
    asyncio.run(main())