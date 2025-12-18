// Razorpay Configuration
export const RAZORPAY_KEY_ID = 'rzp_live_RFX8UK05mWECwo';

// Declare Razorpay type for TypeScript
declare global {
  interface Window {
    Razorpay: any;
  }
}

// Load Razorpay script dynamically
export const loadRazorpayScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Window is not available'));
      return;
    }

    // Check if Razorpay is already loaded
    if (window.Razorpay) {
      resolve();
      return;
    }

    // Check if script is already being loaded
    const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve());
      existingScript.addEventListener('error', () => reject(new Error('Failed to load Razorpay script')));
      return;
    }

    // Create and load script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Razorpay script'));
    document.body.appendChild(script);
  });
};

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  image?: string;
  order_id?: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
  };
  handler: (response: RazorpayResponse) => void;
  modal?: {
    ondismiss?: () => void;
  };
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export const openRazorpayCheckout = async (options: RazorpayOptions): Promise<void> => {
  await loadRazorpayScript();

  if (!window.Razorpay) {
    throw new Error('Razorpay SDK not loaded');
  }

  const razorpay = new window.Razorpay(options);
  razorpay.open();
};

export type { RazorpayOptions, RazorpayResponse };



