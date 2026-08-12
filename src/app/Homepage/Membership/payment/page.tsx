'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';
import MembershipApiService, { Pricing } from '@/lib/membershipApiService';
import { openRazorpayCheckout, RAZORPAY_KEY_ID, RazorpayResponse } from '@/lib/razorpay';
import { CreditCard, Tag, Shield, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

// Helper to get user profile from cookies
const getUserProfile = (): { name?: string; email?: string; phone?: string; _id?: string; id?: string } | null => {
  try {
    const userStr = Cookies.get('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
  } catch (e) {
    console.error('Error parsing user cookie:', e);
  }
  return null;
};

function PaymentPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planId = searchParams.get('planId') || '';
  const planName = searchParams.get('planName') || 'Membership Plan';
  const basePrice = parseFloat(searchParams.get('basePrice') || '0');

  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState<string | null>(null);
  const [pricing, setPricing] = useState<Pricing | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<{ name?: string } | null>(null);
  const [userProfile, setUserProfile] = useState<{ name?: string; email?: string; phone?: string; _id?: string; id?: string } | null>(null);

  const loadUserProfile = useCallback(() => {
    const profile = getUserProfile();
    if (profile) {
      setUserProfile(profile);
    }
  }, []);

  const loadPlanPricing = useCallback(async () => {
    try {
      setLoading(true);
      const pricingData = await MembershipApiService.getPlanPricing(planId);
      setPricing(pricingData.pricing);
    } catch (error) {
      console.error('Error loading pricing:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load pricing information';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [planId]);

  useEffect(() => {
    loadUserProfile();
    loadPlanPricing();
  }, [loadUserProfile, loadPlanPricing]);

  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      toast.error('Please enter a coupon code');
      return;
    }

    setCouponError(null);

    try {
      setLoading(true);

      // First, validate the coupon to check finalAmount
      const basePricing = await MembershipApiService.getPlanPricing(planId);
      const couponValidation = await MembershipApiService.validateCoupon(
        couponCode,
        planId,
        'Personal',
        basePricing.pricing.subtotal
      );

      if (!couponValidation.valid) {
        setCouponError('Invalid coupon code');
        toast.error('Invalid coupon code');
        return;
      }

      // Check if coupon gives 100% off (finalAmount is 0)
      const finalAmount = couponValidation.finalAmount || 0;
      const is100PercentOff = finalAmount <= 0.01; // Consider amounts <= 0.01 as free

      if (is100PercentOff) {
        console.log('🎉 100% off coupon detected! finalAmount:', finalAmount);
        console.log('🎉 Assigning membership directly...');

        // Get user ID
        const profile = userProfile || getUserProfile();
        if (!profile || (!profile._id && !profile.id)) {
          throw new Error('User data not found. Please try again.');
        }

        const userId = profile._id || profile.id;
        if (!userId) {
          throw new Error('User ID not found. Please try again.');
        }

        // Call assign-with-coupon API
        const assignResult = await MembershipApiService.assignWithCoupon(userId, planId, couponCode);

        console.log('✅ Membership assigned successfully with 100% off coupon!', assignResult);

        // Update pricing display
        const result = await MembershipApiService.getPlanPricing(planId, couponCode);
        setAppliedCoupon(couponValidation.couponCode || { name: couponCode });
        setPricing(result.pricing);

        // Show success and redirect
        toast.success('Membership activated successfully!');
        setTimeout(() => {
          router.push('/Homepage/Membership');
        }, 2000);
      } else {
        // Normal coupon application flow
        const result = await MembershipApiService.getPlanPricing(planId, couponCode);
        setAppliedCoupon(couponValidation.couponCode ? { name: couponCode } : null);
        setPricing(result.pricing);
        toast.success('Coupon applied successfully!');
      }
    } catch (error) {
      console.error('Error applying coupon:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to apply coupon code';
      setCouponError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const initiatePayment = async () => {
    try {
      setLoading(true);

      // Step 1: Create payment order on backend
      console.log('🔄 Creating payment order...');
      console.log('Plan ID:', planId);
      console.log('Coupon Code:', appliedCoupon ? couponCode : null);

      const orderData = await MembershipApiService.createPaymentOrder(planId, appliedCoupon ? couponCode : null);

      console.log('✅ Order created:', orderData);
      console.log('Order ID:', orderData?.order?.id);
      console.log('Order Amount:', orderData?.order?.amount);

      // Step 2: Open Razorpay checkout
      if (!RAZORPAY_KEY_ID) {
        toast.error('Payment is not configured. Set NEXT_PUBLIC_RAZORPAY_KEY_ID.');
        return;
      }
      const profile = userProfile || getUserProfile();

      await openRazorpayCheckout({
        key: RAZORPAY_KEY_ID,
        amount: orderData.order.amount,
        currency: orderData.order.currency || 'INR',
        name: 'Samsara Wellness',
        description: planName,
        image: 'https://samsarawellness.in/logo.png',
        order_id: orderData.order.id,
        prefill: {
          name: profile?.name || 'User',
          email: profile?.email || 'user@example.com',
          contact: profile?.phone || '9999999999',
        },
        notes: {
          planId: planId,
          planName: planName,
          couponCode: appliedCoupon ? couponCode : '',
        },
        theme: {
          color: '#EA6C13',
        },
        handler: async (response: RazorpayResponse) => {
          console.log('Payment Success:', response);

          try {
            // Verify payment
            const verificationResult = await MembershipApiService.verifyPayment(
              response.razorpay_order_id,
              response.razorpay_payment_id,
              response.razorpay_signature
            );

            console.log('Payment verification result:', verificationResult);

            if (verificationResult.success) {
              toast.success('Payment successful! Membership activated.');
              setTimeout(() => {
                router.push('/Homepage/Membership');
              }, 2000);
            } else {
              toast.error('Payment verification failed. Please contact support.');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            toast.error('Payment verification failed. Please contact support.');
          }
        },
        modal: {
          ondismiss: () => {
            console.log('Payment cancelled');
            toast.error('Payment was cancelled');
          },
        },
      });
    } catch (error) {
      console.error('Payment error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to process payment';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderPricingBreakdown = () => {
    if (!pricing) return null;

    return (
      <div className="bg-white rounded-xl border border-orange-100/80 p-4 shadow-sm mb-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Pricing</h3>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Base price</span>
            <span className="font-medium text-gray-800">₹{pricing.basePrice}</span>
          </div>

          {pricing.taxes.gst ? (
            <div className="flex justify-between">
              <span className="text-gray-500">GST ({pricing.taxes.gst.rate}%)</span>
              <span className="font-medium text-gray-800">₹{pricing.taxes.gst.amount.toFixed(2)}</span>
            </div>
          ) : null}

          <div className="flex justify-between">
            <span className="text-gray-500">Subtotal</span>
            <span className="font-medium text-gray-800">₹{pricing.subtotal.toFixed(2)}</span>
          </div>

          {pricing.discount ? (
            <div className="flex justify-between">
              <span className="text-gray-500">Discount{appliedCoupon?.name ? ` (${appliedCoupon.name})` : ''}</span>
              <span className="font-medium text-green-600">-₹{pricing.discount.amount.toFixed(2)}</span>
            </div>
          ) : null}

          <div className="flex justify-between pt-2 border-t border-orange-100">
            <span className="font-semibold text-gray-900">Total</span>
            <span className="font-semibold text-orange-600">₹{pricing.total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    );
  };

  if (loading && !pricing) {
    return (
      <div className="px-4 sm:px-6 py-16 max-w-xl mx-auto flex justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-orange-500 border-t-transparent mx-auto mb-3" aria-label="Loading" />
          <p className="text-sm text-gray-500">Loading pricing…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 py-6 max-w-xl mx-auto w-full">
      <div className="mb-5">
        <Link
          href="/Homepage/Membership"
          className="inline-flex items-center gap-1.5 text-sm text-orange-500 hover:text-orange-600 mb-3"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden />
          Back to plans
        </Link>
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Complete payment</h1>
        <p className="text-sm text-gray-500 mt-0.5">{planName}</p>
      </div>

      {renderPricingBreakdown()}

      <div className="bg-white rounded-xl border border-orange-100/80 p-4 shadow-sm mb-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Tag className="w-4 h-4 text-orange-500" aria-hidden />
          Coupon
        </h3>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Enter code"
            value={couponCode}
            onChange={(e) => {
              setCouponCode(e.target.value);
              if (couponError) setCouponError(null);
            }}
            disabled={!!appliedCoupon || loading}
            aria-label="Coupon code"
            aria-invalid={!!couponError}
            aria-describedby={couponError ? 'coupon-error' : undefined}
            className={`flex-1 border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100 min-h-[44px] ${
              couponError ? 'border-red-400' : 'border-gray-200'
            }`}
          />
          <button
            type="button"
            onClick={applyCoupon}
            disabled={loading || !!appliedCoupon}
            className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors min-h-[44px] ${
              appliedCoupon
                ? 'bg-green-500 text-white cursor-not-allowed'
                : 'bg-orange-500 text-white hover:bg-orange-600 disabled:bg-gray-300'
            }`}
          >
            {appliedCoupon ? 'Applied' : 'Apply'}
          </button>
        </div>
        {couponError ? (
          <p id="coupon-error" className="mt-2 text-sm text-red-600" role="alert">
            {couponError}
          </p>
        ) : null}
        {appliedCoupon && !couponError ? (
          <p className="mt-2 text-sm text-green-600">Coupon applied</p>
        ) : null}
      </div>

      <div className="rounded-xl border border-dashed border-orange-200 bg-orange-50/40 p-4 mb-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <Shield className="w-4 h-4 text-orange-500" aria-hidden />
          Secure checkout
        </h3>
        <p className="text-xs text-gray-500 leading-relaxed">
          Payments are processed by Razorpay. You&apos;ll get a confirmation email after a successful payment.
        </p>
      </div>

      <button
        type="button"
        onClick={initiatePayment}
        disabled={loading}
        className={`w-full py-3 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 min-h-[48px] ${
          loading
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-orange-500 text-white hover:bg-orange-600'
        }`}
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" aria-hidden />
            <span>Processing…</span>
          </>
        ) : (
          <>
            <CreditCard className="w-4 h-4" aria-hidden />
            <span>Pay ₹{pricing?.total.toFixed(2) || basePrice}</span>
          </>
        )}
      </button>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <PaymentPageContent />
    </Suspense>
  );
}

