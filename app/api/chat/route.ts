
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const FASTAPI_URL = "http://localhost:8000/api/chat"; // FastAPI Backend URL

export async function POST(req: NextRequest) {
  const { location } = await req.json();

  try {
    const response = await axios.post(FASTAPI_URL, { location });
    return NextResponse.json(response.data);
  } catch (error) {
    console.error("Error calling FastAPI:", error);
    return NextResponse.json({ reply: "Error connecting to AI service." }, { status: 500 });
  }
}
