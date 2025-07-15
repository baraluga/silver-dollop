interface BillabilityConfig {
  idealRatio: number;
  idealRatioPercentage: number;
  description: string;
}

export function getBillabilityConfig(): BillabilityConfig {
  return {
    idealRatio: 0.75,
    idealRatioPercentage: 75,
    description: 'Ideal billability ratio target for team performance'
  };
}