/**
 * Launch Plan helpers for the consumer web membership catalog.
 */

type PlanLike = {
  name?: string;
  metadata?: Record<string, unknown>;
} | null | undefined;

/**
 * Whether a catalog plan is the Launch Plan.
 */
export function isLaunchPlan(plan: PlanLike): boolean {
  if (!plan) return false;
  if (plan.metadata?.isLaunchPlan === true) return true;
  return String(plan.name || '').toLowerCase() === 'launch plan';
}

/**
 * Marketing member cap for Launch Plan cards. Not a purchase hard-limit.
 */
export function getLaunchDisplayMemberCap(plan: PlanLike): number {
  const n = Number(plan?.metadata?.displayMemberCap);
  return Number.isFinite(n) && n > 0 ? n : 300;
}
