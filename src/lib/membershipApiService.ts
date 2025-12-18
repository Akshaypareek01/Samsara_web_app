import { BASE_URL } from './utils';

// Helper to get access token from cookies
const getAccessToken = (): string | null => {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; accessToken=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
};

// Helper to make authenticated requests
const makeRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<any> => {
  const token = getAccessToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

interface Plan {
  _id: string;
  id?: string;
  name: string;
  description: string;
  basePrice: number;
  validityDays: number;
  features: string[];
  planType?: string;
  metadata?: any;
}

interface Pricing {
  basePrice: number;
  subtotal: number;
  total: number;
  discount?: {
    amount: number;
    percentage?: number;
  };
  taxes: {
    gst?: {
      rate: number;
      amount: number;
    };
  };
}

interface Membership {
  _id: string;
  planId: {
    _id: string;
    name: string;
    planType?: string;
  };
  planName: string;
  status: string;
  startDate: string;
  endDate: string;
  daysRemaining: number;
  amountPaid: number;
  couponCode?: {
    code: string;
  };
  metadata?: any;
}

interface Transaction {
  _id: string;
  planName: string;
  status: string;
  transactionId: string;
  amount: number;
  paymentMethod: string;
  paidAt: string;
  couponCode?: {
    code: string;
  };
  discountAmount: number;
}

class MembershipApiService {
  // Membership Plans
  async getActivePlans(): Promise<Plan[]> {
    try {
      console.log('=== MEMBERSHIP API SERVICE: Getting active plans ===');
      const data = await makeRequest('/membership-plans/active');
      console.log('Active plans response:', data);
      return data.results || data;
    } catch (error) {
      console.error('Error getting active plans:', error);
      throw error;
    }
  }

  async getPlanPricing(planId: string, couponCode: string | null = null): Promise<{ pricing: Pricing; plan: Plan }> {
    try {
      console.log('=== MEMBERSHIP API SERVICE: Getting plan pricing ===');
      console.log('Plan ID:', planId, 'Coupon Code:', couponCode);

      const endpoint = couponCode
        ? `/membership-plans/${planId}/pricing?couponCode=${couponCode}`
        : `/membership-plans/${planId}/pricing`;

      const data = await makeRequest(endpoint);
      console.log('Plan pricing response:', data);
      return data;
    } catch (error) {
      console.error('Error getting plan pricing:', error);
      throw error;
    }
  }

  // Coupons
  async getActiveCoupons(): Promise<any[]> {
    try {
      console.log('=== MEMBERSHIP API SERVICE: Getting active coupons ===');
      const data = await makeRequest('/coupons/active');
      console.log('Active coupons response:', data);
      return data.results || data;
    } catch (error) {
      console.error('Error getting active coupons:', error);
      throw error;
    }
  }

  async validateCoupon(
    code: string,
    planId: string,
    userCategory: string,
    orderAmount: number
  ): Promise<{ valid: boolean; finalAmount: number; couponCode?: any }> {
    try {
      console.log('=== MEMBERSHIP API SERVICE: Validating coupon ===');
      console.log('Coupon code:', code, 'Plan ID:', planId, 'User Category:', userCategory, 'Order Amount:', orderAmount);

      const data = await makeRequest('/coupons/validate', {
        method: 'POST',
        body: JSON.stringify({
          code,
          planId,
          userCategory,
          orderAmount,
        }),
      });

      console.log('Coupon validation response:', data);
      return data;
    } catch (error) {
      console.error('Error validating coupon:', error);
      throw error;
    }
  }

  // Payments
  async createPaymentOrder(planId: string, couponCode: string | null = null): Promise<any> {
    try {
      console.log('=== MEMBERSHIP API SERVICE: Creating payment order ===');
      console.log('Plan ID:', planId, 'Coupon Code:', couponCode);

      const data = await makeRequest('/payments/create-order', {
        method: 'POST',
        body: JSON.stringify({
          planId,
          couponCode,
        }),
      });

      console.log('Payment order response:', data);
      return data;
    } catch (error) {
      console.error('Error creating payment order:', error);
      throw error;
    }
  }

  async verifyPayment(
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string
  ): Promise<any> {
    try {
      console.log('=== MEMBERSHIP API SERVICE: Verifying payment ===');
      console.log('Order ID:', razorpayOrderId, 'Payment ID:', razorpayPaymentId);

      const data = await makeRequest('/payments/verify', {
        method: 'POST',
        body: JSON.stringify({
          razorpay_order_id: razorpayOrderId,
          razorpay_payment_id: razorpayPaymentId,
          razorpay_signature: razorpaySignature,
        }),
      });

      console.log('Payment verification response:', data);
      return data;
    } catch (error) {
      console.error('Error verifying payment:', error);
      throw error;
    }
  }

  // User Memberships
  async getActiveMembership(): Promise<Membership | null> {
    try {
      console.log('=== MEMBERSHIP API SERVICE: Getting active membership ===');
      const data = await makeRequest('/payments/memberships/active');
      console.log('Active membership response:', data);
      return data;
    } catch (error: any) {
      console.error('Error getting active membership:', error);
      if (error.message?.includes('404') || error.message?.includes('Not Found')) {
        return null; // No active membership
      }
      throw error;
    }
  }

  async getUserMemberships(limit: number = 10, page: number = 1): Promise<{ results: Membership[] } | Membership[]> {
    try {
      console.log('=== MEMBERSHIP API SERVICE: Getting user memberships ===');
      console.log('Limit:', limit, 'Page:', page);

      const data = await makeRequest(`/payments/memberships?limit=${limit}&page=${page}`);
      console.log('User memberships response:', data);
      return data;
    } catch (error) {
      console.error('Error getting user memberships:', error);
      throw error;
    }
  }

  async getUserTransactions(limit: number = 20, page: number = 1): Promise<{ results: Transaction[] } | Transaction[]> {
    try {
      console.log('=== MEMBERSHIP API SERVICE: Getting user transactions ===');
      console.log('Limit:', limit, 'Page:', page);

      const data = await makeRequest(`/payments/transactions?limit=${limit}&page=${page}`);
      console.log('User transactions response:', data);
      return data;
    } catch (error) {
      console.error('Error getting user transactions:', error);
      throw error;
    }
  }

  // Assign membership with coupon (for 100% off coupons)
  async assignWithCoupon(userId: string, planId: string, couponCode: string): Promise<any> {
    try {
      console.log('=== MEMBERSHIP API SERVICE: Assigning membership with coupon ===');
      console.log('User ID:', userId, 'Plan ID:', planId, 'Coupon Code:', couponCode);

      const response = await makeRequest('/memberships/assign-with-coupon', {
        method: 'POST',
        body: JSON.stringify({
          userId,
          planId,
          couponCode,
        }),
      });

      console.log('Assign with coupon response:', response);
      return response;
    } catch (error) {
      console.error('Error assigning membership with coupon:', error);
      throw error;
    }
  }
}

export default new MembershipApiService();
export type { Plan, Pricing, Membership, Transaction };



