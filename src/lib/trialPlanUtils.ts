import MembershipApiService, { Plan, Membership } from './membershipApiService';

/**
 * Check if a plan is a trial plan
 */
export const isTrialPlan = (plan: Plan | null | undefined): boolean => {
  if (!plan) return false;

  // Check multiple ways to identify trial plans
  return (
    plan.planType === 'trial' ||
    plan.name?.toLowerCase().includes('trial') ||
    plan.description?.toLowerCase().includes('trial') ||
    (plan.metadata && plan.metadata.isTrialPlan === true) ||
    ((plan as Plan & { couponCodeString?: string }).couponCodeString === 'TRIAL_FREE')
  );
};

/**
 * Check if a membership is a trial membership
 */
export const isTrialMembership = (membership: Membership | null | undefined): boolean => {
  if (!membership) return false;

  return !!(
    membership.planId?.planType === 'trial' ||
    membership.planName?.toLowerCase().includes('trial') ||
    ((membership as Membership & { couponCodeString?: string }).couponCodeString === 'TRIAL_FREE') ||
    (membership.metadata && membership.metadata.isTrialPlan === true)
  );
};

/**
 * Check if user has ever had a trial plan (from membership history)
 */
export const hasUserHadTrialPlan = async (userId: string | null | undefined): Promise<boolean> => {
  try {
    if (!userId) return false;

    // Get user's membership history
    const membershipsData = await MembershipApiService.getUserMemberships(50, 1);
    const memberships = Array.isArray(membershipsData)
      ? membershipsData
      : (membershipsData?.results || []);

    // Check if any membership in history is a trial plan
    const hasTrialInHistory = memberships.some((membership) => isTrialMembership(membership));

    console.log('🔍 Trial plan check for user:', userId);
    console.log('📊 Total memberships in history:', memberships.length);
    console.log('🎯 Has trial in history:', hasTrialInHistory);

    return hasTrialInHistory;
  } catch (error) {
    console.error('Error checking trial plan history:', error);
    // If we can't check history, assume they haven't had a trial (safer for business)
    return false;
  }
};

/**
 * Filter out trial plans for users who have already had one
 */
export const filterTrialPlansForUser = (plans: Plan[], hasHadTrial: boolean): Plan[] => {
  if (!Array.isArray(plans)) return [];

  if (hasHadTrial) {
    // Filter out trial plans if user has had one before
    const filteredPlans = plans.filter((plan) => !isTrialPlan(plan));
    console.log('🚫 Filtered out trial plans for user who has had one before');
    console.log('📊 Original plans:', plans.length, 'Filtered plans:', filteredPlans.length);
    return filteredPlans;
  }

  // Return all plans if user hasn't had a trial
  return plans;
};



