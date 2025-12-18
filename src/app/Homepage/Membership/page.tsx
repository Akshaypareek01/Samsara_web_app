'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';
import MembershipApiService, { Plan, Membership } from '@/lib/membershipApiService';
import { hasUserHadTrialPlan, filterTrialPlansForUser, isTrialPlan } from '@/lib/trialPlanUtils';
import { Check, Crown, Sparkles } from 'lucide-react';

// Helper to get user ID from cookies
const getUserId = (): string | null => {
  try {
    const userStr = Cookies.get('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      return user._id || user.id || null;
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
      const userId = getUserId();
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

      // Filter out trial plans if user has had one before
      const filteredPlans = filterTrialPlansForUser(plansData, hasHadTrial);
      setPlans(filteredPlans);
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
    if (activeMembership && activeMembership.planId._id === planId) {
      toast.error('You already have an active membership for this plan');
      return;
    }

    router.push(`/Homepage/Membership/payment?planId=${planId}&planName=${encodeURIComponent(plan.name)}&basePrice=${plan.basePrice}`);
  };

  const renderPlanCard = (plan: Plan) => {
    const planId = plan._id || plan.id;
    const isActive = !!(activeMembership && activeMembership.planId._id === planId);
    const isTrial = isTrialPlan(plan);

    return (
      <div
        key={planId}
        className={`relative bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl ${
          isActive ? 'ring-2 ring-green-500' : ''
        }`}
      >
        {isActive && (
          <div className="absolute top-0 right-4 bg-green-500 text-white px-4 py-1 rounded-b-lg text-xs font-bold z-10">
            ACTIVE
          </div>
        )}

        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-6">
          <div className="flex items-center justify-center gap-2">
            {isTrial && <Sparkles className="w-5 h-5 text-yellow-300" />}
            {!isTrial && <Crown className="w-5 h-5 text-yellow-300" />}
            <h3 className="text-2xl font-bold text-white text-center uppercase">{plan.name}</h3>
          </div>
        </div>

        {/* Price */}
        <div className="bg-yellow-200 px-6 py-8 flex items-center justify-center gap-1">
          <span className="text-lg text-black mt-[-10px]">₹</span>
          <span className="text-4xl font-semibold text-black">{plan.basePrice}</span>
          <span className="text-lg text-black mt-[10px]">/{plan.validityDays} days</span>
        </div>

        {/* Description */}
        <div className="px-6 py-6">
          <p className="text-gray-600 text-lg mb-6">{plan.description}</p>

          {/* Features */}
          {plan.features && plan.features.length > 0 && (
            <div className="mb-6">
              <h4 className="text-gray-800 font-bold text-lg mb-4">Features:</h4>
              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2 text-gray-600">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Button */}
          <button
            onClick={() => handleSelectPlan(plan)}
            disabled={isActive}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-200 ${
              isActive
                ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                : 'bg-orange-500 text-white hover:bg-orange-600 active:scale-95'
            }`}
          >
            {isActive ? 'Current Plan' : 'Get Plan'}
          </button>
        </div>
      </div>
    );
  };

  const renderActiveMembership = () => {
    if (!activeMembership) return null;

    return (
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Active Membership</h2>
        <div className="bg-green-50 border-2 border-green-500 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-800">{activeMembership.planName}</h3>
            <span className="bg-green-500 text-white px-3 py-1 rounded-lg text-xs font-bold">
              {activeMembership.status.toUpperCase()}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-gray-600 text-sm">Start Date</p>
              <p className="font-semibold text-gray-800">
                {new Date(activeMembership.startDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">End Date</p>
              <p className="font-semibold text-gray-800">
                {new Date(activeMembership.endDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Days Remaining</p>
              <p className="font-semibold text-gray-800">{activeMembership.daysRemaining} days</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Amount Paid</p>
              <p className="font-semibold text-gray-800">₹{activeMembership.amountPaid}</p>
            </div>
          </div>

          <Link
            href="/Homepage/Membership/history"
            className="block w-full bg-green-500 text-white text-center py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors"
          >
            View History
          </Link>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading membership plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Membership Plans</h1>
          <p className="text-gray-600 text-lg">Choose the perfect plan for your wellness journey</p>
        </div>

        {renderActiveMembership()}

        {/* Plans Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Available Plans</h2>
          {plans.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plans.map(renderPlanCard)}
            </div>
          ) : (
            <div className="bg-white rounded-xl p-8 text-center">
              <p className="text-gray-600 text-lg">No membership plans available at the moment.</p>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="bg-white rounded-xl p-6 shadow-md">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Why Choose Samsara?</h3>
          <ul className="space-y-2">
            <li className="flex items-start gap-2 text-gray-600">
              <Check className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
              <span>Expert-led yoga and wellness classes</span>
            </li>
            <li className="flex items-start gap-2 text-gray-600">
              <Check className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
              <span>Personalized health tracking and insights</span>
            </li>
            <li className="flex items-start gap-2 text-gray-600">
              <Check className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
              <span>Community support and guidance</span>
            </li>
            <li className="flex items-start gap-2 text-gray-600">
              <Check className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
              <span>Flexible membership options</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

