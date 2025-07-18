interface BillabilityConfig {
  idealRatio: number;
  idealRatioPercentage: number;
  description: string;
}

export function getBillabilityConfig(): BillabilityConfig {
  return {
    idealRatio: 0.77,
    idealRatioPercentage: 77,
    description: "Ideal billability ratio target for team performance",
  };
}
