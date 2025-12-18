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
      toast.error('Please enter a coupon code');
      return;
    }

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
      <div className="bg-white rounded-xl p-6 shadow-md mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Pricing Breakdown</h3>

        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Base Price:</span>
            <span className="font-semibold text-gray-800">₹{pricing.basePrice}</span>
          </div>

          {pricing.taxes.gst && (
            <div className="flex justify-between">
              <span className="text-gray-600">GST ({pricing.taxes.gst.rate}%):</span>
              <span className="font-semibold text-gray-800">₹{pricing.taxes.gst.amount.toFixed(2)}</span>
            </div>
          )}

          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal:</span>
            <span className="font-semibold text-gray-800">₹{pricing.subtotal.toFixed(2)}</span>
          </div>

          {pricing.discount && (
            <div className="flex justify-between">
              <span className="text-gray-600">Discount ({appliedCoupon?.name}):</span>
              <span className="font-semibold text-green-600">-₹{pricing.discount.amount.toFixed(2)}</span>
            </div>
          )}

          <div className="flex justify-between pt-3 border-t-2 border-gray-200">
            <span className="text-lg font-bold text-gray-800">Total:</span>
            <span className="text-lg font-bold text-blue-600">₹{pricing.total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    );
  };

  if (loading && !pricing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading pricing information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/Homepage/Membership"
            className="inline-flex items-center gap-2 text-orange-500 hover:text-orange-600 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Plans</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Complete Payment</h1>
          <p className="text-gray-600 text-lg">{planName}</p>
        </div>

        {renderPricingBreakdown()}

        {/* Coupon Section */}
        <div className="bg-white rounded-xl p-6 shadow-md mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Tag className="w-5 h-5 text-orange-500" />
            Have a coupon code?
          </h3>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Enter coupon code"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              disabled={!!appliedCoupon || loading}
              className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100"
            />
            <button
              onClick={applyCoupon}
              disabled={loading || !!appliedCoupon}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                appliedCoupon
                  ? 'bg-green-500 text-white cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600 disabled:bg-gray-400'
              }`}
            >
              {appliedCoupon ? 'Applied' : 'Apply'}
            </button>
          </div>
        </div>

        {/* Payment Info */}
        <div className="bg-white rounded-xl p-6 shadow-md mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-500" />
            Payment Information
          </h3>
          <ul className="space-y-2 text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-green-500">•</span>
              <span>Secure payment powered by Razorpay</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">•</span>
              <span>Your payment information is encrypted and secure</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">•</span>
              <span>You will receive a confirmation email after payment</span>
            </li>
          </ul>
        </div>

        {/* Pay Button */}
        <button
          onClick={initiatePayment}
          disabled={loading}
          className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-200 flex items-center justify-center gap-2 ${
            loading
              ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
              : 'bg-blue-500 text-white hover:bg-blue-600 active:scale-95'
          }`}
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Processing...</span>
            </>
          ) : (
            <>
              <CreditCard className="w-5 h-5" />
              <span>Pay ₹{pricing?.total.toFixed(2) || basePrice}</span>
            </>
          )}
        </button>
      </div>
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

