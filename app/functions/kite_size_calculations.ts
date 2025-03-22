// utils/kite_size_calculations.ts
export function calculateKiteSize(windSpeed: number, userWeight: number): number {
    return (userWeight / windSpeed) * 2.2;
  }
  
  export function calculateKiteSizeProbabilities(kiteSizes: number[]): number[] {
    const averageSize = kiteSizes.reduce((a, b) => a + b, 0) / kiteSizes.length;
    return kiteSizes.map((size) => {
      return Math.exp(-Math.pow(size - averageSize, 2) / (2 * Math.pow(1, 2)));
    });
  }
  