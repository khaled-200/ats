'use client';
import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import { unlock } from '@/store/paymentSlice';
import { X, Lock, RefreshCw, AlertCircle } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PaymentModal({ isOpen, onClose }: PaymentModalProps) {
  const dispatch = useAppDispatch();
  const isUnlocked = useAppSelector(state => state.payment.isUnlocked);
  const { resumes, activeResumeId } = useAppSelector(state => state.resume);
  const activeResume = resumes.find(r => r.id === activeResumeId) || resumes[0];

  const [activePayTab, setActivePayTab] = useState<'paypal' | 'sham'>('paypal');
  const [couponCode, setCouponCode] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState<boolean>(false);

  // Config parameters
  const OWNER_WHATSAPP = "963955123456";
  const SHAMCASH_WALLET = "0963-955-123-456";

  // Pre-filled WhatsApp message for buying codes
  const cvIdText = activeResume ? `(ID: ${activeResume.id})` : '';
  const waMessage = encodeURIComponent(`Hello, I want to purchase an unlock code for my CV ${cvIdText}.`);
  const waLink = `https://wa.me/${OWNER_WHATSAPP}?text=${waMessage}`;

  // Load PayPal SDK dynamically on mount if modal is open
  useEffect(() => {
    if (!isOpen || isScriptLoaded || typeof window === 'undefined') return;

    // Remove existing paypal script if any
    const existingScript = document.getElementById('paypal-sdk-script');
    if (existingScript) existingScript.remove();

    const script = document.createElement('script');
    script.id = 'paypal-sdk-script';
    script.src = `https://www.paypal.com/sdk/js?client-id=sb&currency=USD`; // sb stands for sandbox
    script.async = true;
    script.onload = () => {
      setIsScriptLoaded(true);
      initializePaypalButtons();
    };
    script.onerror = () => {
      console.error("Failed to load PayPal SDK");
    };

    document.body.appendChild(script);
  }, [isOpen]);

  const initializePaypalButtons = () => {
    const paypal = (window as any).paypal;
    if (!paypal) return;

    const container = document.getElementById('paypal-button-mount');
    if (!container) return;
    container.innerHTML = ''; // clear loading text

    paypal.Buttons({
      createOrder: (data: any, actions: any) => {
        return actions.order.create({
          purchase_units: [{
            amount: {
              value: "1.00",
              currency_code: "USD"
            },
            description: "Premium ATS Resume Download Unlock Fee"
          }]
        });
      },
      onApprove: (data: any, actions: any) => {
        return actions.order.capture().then((details: any) => {
          dispatch(unlock());
          alert("🎉 Payment successful! Downloads are unlocked.");
          onClose();
        });
      },
      onError: (err: any) => {
        console.error("PayPal checkout error", err);
        setErrorMessage("PayPal checkout encountered an error. Please try again or use the coupon code redemption option.");
      }
    }).render('#paypal-button-mount');
  };

  // Redeem Coupon Code Action
  const handleRedeemCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await fetch('/api/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode.trim() })
      });

      const resData = await response.json();

      if (response.ok && resData.success) {
        dispatch(unlock());
        alert("🎉 Code verified! Resume downloads have been successfully unlocked.");
        onClose();
      } else {
        setErrorMessage(resData.error || "Incorrect code. Please double-check or request a new code.");
      }
    } catch (err) {
      console.error("Redeem code error:", err);
      setErrorMessage("Network error connecting to database. Please check your internet connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
      />

      {/* Modal Content Card */}
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 overflow-hidden animation-fade-in z-10 text-slate-100">
        
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2 text-indigo-400">
            <Lock size={18} />
            <h3 className="text-base font-bold text-slate-100">Unlock PDF & Word Downloads</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Info */}
        <p className="text-xs text-slate-400 mb-5 leading-relaxed">
          Editing and previewing your resume is 100% free. Unlock PDF, Word, and Plain Text downloads permanently for this session for just $1.
        </p>

        {/* Error banner */}
        {errorMessage && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-2.5 rounded-lg mb-4 text-xs flex items-start gap-2">
            <AlertCircle size={14} className="shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Tab Header Selector */}
        <div className="flex border-b border-slate-800 pb-2 gap-2 mb-4">
          <button 
            onClick={() => setActivePayTab('paypal')}
            className={`flex-1 py-1.5 text-center text-xs font-bold rounded-lg transition-all ${
              activePayTab === 'paypal' 
                ? 'bg-slate-800 text-white border border-slate-700/60' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            PayPal (Automatic)
          </button>
          <button 
            onClick={() => setActivePayTab('sham')}
            className={`flex-1 py-1.5 text-center text-xs font-bold rounded-lg transition-all ${
              activePayTab === 'sham' 
                ? 'bg-slate-800 text-white border border-slate-700/60' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Redeem Coupon Code
          </button>
        </div>

        {/* Tab 1: PayPal checkout */}
        {activePayTab === 'paypal' && (
          <div className="space-y-4 py-2">
            <div id="paypal-button-mount" className="min-h-12 flex flex-col items-center justify-center bg-slate-950 p-3 rounded-lg border border-slate-850">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <RefreshCw size={14} className="animate-spin text-indigo-400" />
                <span>Loading PayPal Buttons...</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: ShamCash Coupon Redeem */}
        {activePayTab === 'sham' && (
          <div className="space-y-4">
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-850 text-[11px] space-y-2 text-slate-400 leading-relaxed">
              <div>
                <strong className="text-slate-200 block text-xs mb-0.5">How to get a code:</strong>
                Transfer $1 to ShamCash: <span className="font-bold text-slate-200 select-all">{SHAMCASH_WALLET}</span>
              </div>
              <div>
                Send the transfer screenshot receipt to the owner via WhatsApp to receive your coupon code instantly:
              </div>
              <a 
                href={waLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-indigo-400 hover:underline font-bold"
              >
                Click to send receipt & Request Code
              </a>
            </div>

            {/* Input Form */}
            <form onSubmit={handleRedeemCode} className="space-y-2.5">
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Enter Coupon Code</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="e.g. CV-A1B2-C3D4"
                  disabled={isLoading}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 text-slate-100 disabled:opacity-50 font-mono"
                />
                <button 
                  type="submit"
                  disabled={isLoading || !couponCode.trim()}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50"
                >
                  {isLoading ? <RefreshCw size={14} className="animate-spin" /> : "Redeem"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
