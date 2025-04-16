import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Copy, CreditCard, QrCode, X } from "lucide-react";
import QRCode from "react-qr-code";

interface PaymentQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentComplete: () => void;
  recipeName: string;
  amount: number;
}

export const PaymentQRModal: React.FC<PaymentQRModalProps> = ({
  isOpen,
  onClose,
  onPaymentComplete,
  recipeName,
  amount,
}) => {
  const [copied, setCopied] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  
  // Generate a unique payment ID
  const [paymentId] = useState(`NEXCOOK-${Date.now().toString(36)}`);
  
  // Auto-complete payment after a short delay (simulating a payment backend)
  useEffect(() => {
    if (!isOpen || isComplete) return;
    
    // When QR is displayed, set up a timer to auto-complete after 6 seconds
    // This simulates the payment being processed after scanning
    const autoCompleteTimer = setTimeout(() => {
      if (isOpen && !isComplete) {
        setIsScanning(true);
        
        // Then complete after 2 more seconds
        setTimeout(() => {
          setIsScanning(false);
          setIsComplete(true);
          
          // Finally proceed to next screen
          setTimeout(() => {
            onPaymentComplete();
          }, 1500);
        }, 2000);
      }
    }, 6000);
    
    return () => clearTimeout(autoCompleteTimer);
  }, [isOpen, isComplete, onPaymentComplete]);

  const handleCopy = () => {
    navigator.clipboard.writeText(paymentId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // For manual testing - simulate scanning
  const handleSimulatePayment = () => {
    if (isComplete) return;
    
    setIsScanning(true);
    
    setTimeout(() => {
      setIsScanning(false);
      setIsComplete(true);
      
      setTimeout(() => {
        onPaymentComplete();
      }, 1500);
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="relative max-h-[90vh] w-full max-w-md overflow-auto rounded-2xl bg-gradient-to-b from-gray-900 to-black p-6 text-white shadow-xl"
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold">Payment Required</h2>
          <button
            className="rounded-full bg-white/10 p-2 hover:bg-white/20"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        <div className="mb-6">
          <div className="mb-4 rounded-xl bg-purple-500/20 p-4">
            <p className="text-sm text-gray-300">Recipe</p>
            <p className="font-medium">{recipeName}</p>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-sm text-gray-300">Total Amount</span>
              <span className="text-xl font-bold">${amount.toFixed(2)}</span>
            </div>
          </div>

          <div className="mb-6 rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="mb-2 flex items-center justify-between">
              <p className="font-medium">NexCook Payment ID</p>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 rounded-lg bg-white/10 px-2 py-1 text-xs hover:bg-white/20"
              >
                {copied ? <CheckCircle size={12} /> : <Copy size={12} />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>
            <p className="font-mono text-sm text-gray-300">{paymentId}</p>
          </div>
        </div>

        <div className="mb-6 text-center">
          <p className="mb-2 font-medium">Scan QR Code to Pay</p>
          <p className="mb-4 text-sm text-gray-400">
            Scan with your camera or payment app
          </p>
          
          {/* QR Code - will auto-complete after a few seconds */}
          <div className="relative mx-auto h-64 w-64 overflow-hidden rounded-xl bg-white p-4">
            {isScanning ? (
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="flex h-full w-full items-center justify-center"
              >
                <QrCode size={100} className="text-purple-500" />
                <p className="absolute text-sm text-purple-600">Processing payment...</p>
              </motion.div>
            ) : isComplete ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex h-full w-full items-center justify-center"
              >
                <CheckCircle size={100} className="text-green-500" />
                <p className="absolute mt-32 text-center text-green-600">Payment confirmed!</p>
              </motion.div>
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <QRCode
                  size={200}
                  value={`https://example.com/pay/${paymentId}`}
                  viewBox="0 0 256 256"
                  className="h-full w-full"
                />
              </div>
            )}
          </div>
        </div>
        
        <div className="flex flex-col gap-2">
          <p className="text-center text-xs text-gray-400">
            Payment secured by NexCook Payment System
          </p>
          <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
            <CreditCard size={12} />
            <span>All major payment methods accepted</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
