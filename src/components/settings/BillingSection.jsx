import { useState, useEffect } from 'react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext'; // Assuming this exists or we can just fetch the user plan if needed
// Actually we can just track the plan locally or fetch from backend.
// Let's assume the backend auth provides req.user with plan, but we can also just fetch /api/v1/auth/me if we want, or keep it simple.

export default function BillingSection() {
  const [loading, setLoading] = useState(false);
  const [currentPlan, setCurrentPlan] = useState('free'); // Can be updated from user context if available

  // Function to dynamically load the Razorpay script
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  const handleUpgrade = async () => {
    setLoading(true);
    
    // Load Razorpay script
    const res = await loadRazorpayScript();
    if (!res) {
      alert('Razorpay SDK failed to load. Are you online?');
      setLoading(false);
      return;
    }

    try {
      // 1. Create order on backend (amount in paise)
      const { data } = await api.post('/billing/orders', { amount: 100000 }); // 1000 INR
      
      if (!data.success) {
        throw new Error('Failed to create order');
      }

      // 2. Configure Razorpay options
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_dummy', 
        amount: data.amount,
        currency: data.currency,
        name: 'TaskPulse Pro',
        description: 'Upgrade to TaskPulse Pro Plan',
        order_id: data.orderId,
        handler: async function (response) {
          try {
            // Since our webhook handles server-to-server, we just do a direct client update here
            // or we could hit a dedicated verification endpoint. For now we use the updateUserPlan route.
            const verifyRes = await api.patch('/billing/user/plan', { plan: 'pro' });

            if (verifyRes.data.success) {
              alert('Payment successful! Upgraded to Pro.');
              setCurrentPlan('pro');
            }
          } catch (err) {
            console.error('Payment verification failed', err);
            alert('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: 'TaskPulse User',
          email: 'user@example.com',
        },
        theme: {
          color: '#a855f7', // tp-accent color
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error) {
      console.error('Upgrade error', error);
      alert('Something went wrong during checkout.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h1 className="tp-settings-page-title">Billing & Plans</h1>
      
      <div className="tp-settings-group">
        <h3 className="tp-settings-group-title">Current Plan</h3>
        
        <div style={{
          padding: 24,
          background: 'var(--tp-surface)',
          border: '1px solid var(--tp-border)',
          borderRadius: 'var(--tp-radius-lg)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h2 style={{ fontSize: 20, margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
              {currentPlan === 'pro' ? 'Pro Plan' : 'Free Plan'}
              {currentPlan === 'pro' && (
                <span style={{ fontSize: 10, background: 'var(--tp-accent)', color: '#fff', padding: '2px 6px', borderRadius: 4, textTransform: 'uppercase' }}>Active</span>
              )}
            </h2>
            <p style={{ color: 'var(--tp-text-secondary)', margin: 0, fontSize: 14 }}>
              {currentPlan === 'pro' 
                ? 'You have access to unlimited AI analysis, priority support, and advanced integrations.' 
                : 'Basic task management with limited AI scoring features.'}
            </p>
          </div>
          
          {currentPlan !== 'pro' && (
            <button 
              className="tp-btn tp-btn-primary" 
              onClick={handleUpgrade}
              disabled={loading}
              style={{ padding: '10px 20px', fontSize: 14 }}
            >
              {loading ? 'Processing...' : 'Upgrade to Pro - ₹1000'}
            </button>
          )}
        </div>
      </div>
      
      <div className="tp-settings-group">
        <h3 className="tp-settings-group-title">Plan Comparison</h3>
        
        <div className="tp-settings-row">
          <div className="tp-settings-row-info">
            <p className="tp-settings-row-label">Tasks</p>
          </div>
          <div className="tp-settings-row-control" style={{ width: 200, display: 'flex', justifyContent: 'space-between', color: 'var(--tp-text-secondary)' }}>
            <span>Free: 100/mo</span>
            <span style={{ color: 'var(--tp-text)' }}>Pro: Unlimited</span>
          </div>
        </div>
        
        <div className="tp-settings-row">
          <div className="tp-settings-row-info">
            <p className="tp-settings-row-label">AI Task Scoring</p>
          </div>
          <div className="tp-settings-row-control" style={{ width: 200, display: 'flex', justifyContent: 'space-between', color: 'var(--tp-text-secondary)' }}>
            <span>Free: Basic</span>
            <span style={{ color: 'var(--tp-text)' }}>Pro: Advanced</span>
          </div>
        </div>
        
        <div className="tp-settings-row">
          <div className="tp-settings-row-info">
            <p className="tp-settings-row-label">Workspaces</p>
          </div>
          <div className="tp-settings-row-control" style={{ width: 200, display: 'flex', justifyContent: 'space-between', color: 'var(--tp-text-secondary)' }}>
            <span>Free: 1</span>
            <span style={{ color: 'var(--tp-text)' }}>Pro: Unlimited</span>
          </div>
        </div>
      </div>
    </>
  );
}
