'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';
import MembershipApiService, { Plan, Membership } from '@/lib/membershipApiService';
import { hasUserHadTrialPlan, filterTrialPlansForUser, isTrialPlan } from '@/lib/trialPlanUtils';
import { getUserId as resolveUserId } from '@/lib/userId';
import { Check, Crown, Sparkles } from 'lucide-react';
import EmptyState from '@/components/EmptyState';
import { formatDisplayDate } from '@/lib/formatDisplayDate';

/**
 * Reads user id from the auth cookie.
 */
const getUserIdFromCookie = (): string | null => {
  try {
    const userStr = Cookies.get('user');
    if (userStr) {
      return resolveUserId(JSON.parse(userStr));
    }
  } catch (e) {
    console.error('Error parsing user cookie:', e);
  }
  return null;
};

export default function MembershipPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeMembership, setActiveMembership] = useState<Membership | null>(null);
  const [hasUserHadTrial, setHasUserHadTrial] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Check if user has had a trial plan before
      const userId = getUserIdFromCookie();
      let hasHadTrial = false;
      if (userId) {
        hasHadTrial = await hasUserHadTrialPlan(userId);
        setHasUserHadTrial(hasHadTrial);
        console.log('🎯 User has had trial plan:', hasHadTrial);
      }

      const [plansData, membershipData] = await Promise.all([
        MembershipApiService.getActivePlans(),
        MembershipApiService.getActiveMembership().catch(() => null),
      ]);

      // Filter out trial plans if user has had one before, and strip any null/invalid entries
      const filteredPlans = filterTrialPlansForUser(plansData, hasHadTrial);
      setPlans(filteredPlans.filter((p): p is Plan => p != null && (p._id != null || p.id != null)));
      setActiveMembership(membershipData);

      console.log('✅ Plans loaded:', plansData.length, 'Filtered plans:', filteredPlans.length);
    } catch (error) {
      console.error('Error loading data:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load membership plans';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = (plan: Plan) => {
    // Check if it's a trial plan and user has had one before
    if (isTrialPlan(plan) && hasUserHadTrial) {
      toast.error('You have already used your trial plan. Please choose a different plan.');
      return;
    }

    const planId = plan._id || plan.id;
    const activePlanId = activeMembership?.planId?._id ?? (activeMembership?.planId as { id?: string } | undefined)?.id;
    if (activePlanId && activePlanId === planId) {
      toast.error('You already have an active membership for this plan');
      return;
    }

    router.push(`/Homepage/Membership/payment?planId=${planId}&planName=${encodeURIComponent(plan.name)}&basePrice=${plan.basePrice}`);
  };

  const renderPlanCard = (plan: Plan) => {
    const planId = plan._id || plan.id;
    const activePlanId = activeMembership?.planId?._id ?? (activeMembership?.planId as { id?: string } | undefined)?.id;
    const isActive = !!(activePlanId && activePlanId === planId);
    const isTrial = isTrialPlan(plan);

    return (
      <div
        key={planId}
        className={`relative bg-white rounded-xl border border-orange-100/80 shadow-sm overflow-hidden transition-shadow hover:shadow-md ${
          isActive ? 'ring-2 ring-orange-400' : ''
        }`}
      >
        {isActive ? (
          <div className="absolute top-0 right-3 bg-orange-500 text-white px-2.5 py-0.5 rounded-b-md text-[10px] font-bold z-10 tracking-wide">
            ACTIVE
          </div>
        ) : null}

        <div className="bg-[#ed662e] px-4 py-4">
          <div className="flex items-center justify-center gap-2">
            {isTrial ? <Sparkles className="w-4 h-4 text-white/90" aria-hidden /> : <Crown className="w-4 h-4 text-white/90" aria-hidden />}
            <h3 className="text-lg font-semibold text-white text-center uppercase tracking-wide">{plan.name}</h3>
          </div>
        </div>

        <div className="bg-[#fff4ef] px-4 py-5 flex items-baseline justify-center gap-1">
          <span className="text-sm text-gray-700">₹</span>
          <span className="text-3xl font-semibold text-gray-900">{plan.basePrice}</span>
          <span className="text-sm text-gray-600">/{plan.validityDays} days</span>
        </div>

        <div className="px-4 py-4">
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">{plan.description}</p>

          {plan.features && plan.features.length > 0 ? (
            <div className="mb-4">
              <h4 className="text-gray-800 font-semibold text-sm mb-2">Includes</h4>
              <ul className="space-y-1.5">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                    <Check className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" aria-hidden />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <button
            type="button"
            onClick={() => handleSelectPlan(plan)}
            disabled={isActive}
            className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-colors min-h-[44px] ${
              isActive
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-orange-500 text-white hover:bg-orange-600'
            }`}
          >
            {isActive ? 'Current plan' : 'Get plan'}
          </button>
        </div>
      </div>
    );
  };

  const renderActiveMembership = () => {
    if (!activeMembership) return null;

    return (
      <div className="mb-6">
        <h2 className="text-base font-semibold text-gray-900 mb-3">Your active membership</h2>
        <div className="rounded-xl border border-[#ffe0d0] bg-[#fff4ef]/70 p-4">
          <div className="flex items-center justify-between gap-3 mb-3">
            <h3 className="text-base font-semibold text-gray-900">{activeMembership.planName}</h3>
            <span className="bg-[#ed662e] text-white px-2.5 py-0.5 rounded-md text-[10px] font-bold tracking-wide">
              {activeMembership.status.toUpperCase()}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
            <div>
              <p className="text-gray-500 text-xs">Start</p>
              <p className="font-medium text-gray-800">
                {formatDisplayDate(activeMembership.startDate, {
                  fallback: "—",
                })}
              </p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">End</p>
              <p className="font-medium text-gray-800">
                {formatDisplayDate(activeMembership.endDate, { fallback: "—" })}
              </p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Days left</p>
              <p className="font-medium text-gray-800">{activeMembership.daysRemaining}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Paid</p>
              <p className="font-medium text-gray-800">₹{activeMembership.amountPaid}</p>
            </div>
          </div>

          <Link
            href="/Homepage/Membership/history"
            className="block w-full bg-white border border-orange-200 text-orange-600 text-center py-2.5 rounded-lg text-sm font-semibold hover:bg-orange-50 transition-colors"
          >
            View history
          </Link>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="px-4 sm:px-6 py-16 max-w-6xl mx-auto flex justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-orange-500 border-t-transparent mx-auto mb-3" aria-label="Loading" />
          <p className="text-sm text-gray-500">Loading membership plans…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 py-6 max-w-6xl mx-auto w-full">
      <div className="mb-5">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Membership</h1>
        <p className="text-sm text-gray-500 mt-0.5">Choose a plan to unlock classes and events</p>
      </div>

      {renderActiveMembership()}

      <div className="mb-6">
        <h2 className="text-base font-semibold text-gray-900 mb-3">Available plans</h2>
        {plans.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {plans.filter((p): p is Plan => p != null && (p._id != null || p.id != null)).map(renderPlanCard)}
          </div>
        ) : (
          <EmptyState message="No membership plans available at the moment." />
        )}
      </div>

      <div className="rounded-xl border border-orange-100/80 bg-white p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Why Samsara</h3>
        <ul className="grid sm:grid-cols-2 gap-2">
          {[
            'Expert-led yoga and wellness classes',
            'Personalized health tracking',
            'Community support and guidance',
            'Flexible membership options',
          ].map((item) => (
            <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
              <Check className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" aria-hidden />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

