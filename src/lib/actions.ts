// This file is empty for now. It can be used for server-side actions in the future.
"use server";

import {
  financialInsightAgent as financialInsightAgentFlow,
  type FinancialInsightAgentInput,
  type FinancialInsightAgentOutput,
} from "@/ai/flows/financial-insight-agent";

import {
  opportunityCostSimulator as opportunityCostSimulatorFlow,
  type OpportunityCostSimulatorInput,
  type OpportunityCostSimulatorOutput,
} from "@/ai/flows/opportunity-cost-simulator";

import {
  recommendSpendingOptions as recommendSpendingOptionsFlow,
  type RecommendSpendingOptionsInput,
  type RecommendSpendingOptionsOutput,
} from "@/ai/flows/location-aware-spending-recommender";

import {
  analyzeCarbonImpact as analyzeCarbonImpactFlow,
  type CarbonImpactInput,
  type CarbonImpactOutput,
} from "@/ai/flows/carbon-impact-agent";

import {
    trackSmsTransactions as trackSmsTransactionsFlow,
    type TrackSmsTransactionsInput,
    type TrackSmsTransactionsOutput,
} from "@/ai/flows/sms-tracker-integration";

export async function financialInsightAgent(
  input: FinancialInsightAgentInput
): Promise<FinancialInsightAgentOutput> {
  return await financialInsightAgentFlow(input);
}

export async function opportunityCostSimulator(
  input: OpportunityCostSimulatorInput
): Promise<OpportunityCostSimulatorOutput> {
  return await opportunityCostSimulatorFlow(input);
}

export async function recommendSpendingOptions(
  input: RecommendSpendingOptionsInput
): Promise<RecommendSpendingOptionsOutput> {
  return await recommendSpendingOptionsFlow(input);
}

export async function analyzeCarbonImpact(
  input: CarbonImpactInput
): Promise<CarbonImpactOutput> {
  return await analyzeCarbonImpactFlow(input);
}

export async function trackSmsTransactions(
    input: TrackSmsTransactionsInput
): Promise<TrackSmsTransactionsOutput> {
    return await trackSmsTransactionsFlow(input);
}
