"use client"

import React, { useState, useEffect } from 'react';
import { AlertCircle, DollarSign, CreditCard, CheckCircle, XCircle, Loader, Eye, EyeOff } from 'lucide-react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('withdrawals');
  const [banks, setBanks] = useState([]);
  const [loadingBanks, setLoadingBanks] = useState(false);
  const [withdrawalForm, setWithdrawalForm] = useState({
    bankCode: '',
    accountNumber: '',
    accountName: '',
    amount: '',
    reason: '',
    eventId: ''
  });
  const [paymentReference, setPaymentReference] = useState('');
  const [paymentVerificationResult, setPaymentVerificationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // Fetch banks on component mount
  useEffect(() => {
    fetchKenyanBanks();
  }, []);

  const fetchKenyanBanks = async () => {
    setLoadingBanks(true);
    try {
      const response = await fetch('/api/paystack/banks');
      const data = await response.json();
      
      if (data.status && data.data) {
        setBanks(data.data);
        addNotification('Banks loaded successfully', 'success');
      } else {
        addNotification('Failed to load banks', 'error');
      }
    } catch (error) {
      console.error('Error fetching banks:', error);
      addNotification('Error loading banks', 'error');
    } finally {
      setLoadingBanks(false);
    }
  };

  const addNotification = (message, type) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(notif => notif.id !== id));
    }, 5000);
  };

  const handleWithdrawalSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // First validate the account details with the selected bank
      const validateResponse = await fetch('/api/paystack/validate-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          account_number: withdrawalForm.accountNumber,
          bank_code: withdrawalForm.bankCode,
        }),
      });

      const validateData = await validateResponse.json();

      if (!validateData.status) {
        addNotification('Invalid account details', 'error');
        setLoading(false);
        return;
      }

      // Create transfer recipient
      const recipientResponse = await fetch('/api/paystack/create-recipient', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'nuban',
          name: withdrawalForm.accountName || validateData.data.account_name,
          account_number: withdrawalForm.accountNumber,
          bank_code: withdrawalForm.bankCode,
          currency: 'KES',
        }),
      });

      const recipientData = await recipientResponse.json();

      if (!recipientData.status) {
        addNotification('Failed to create recipient', 'error');
        setLoading(false);
        return;
      }

      // Initiate transfer
      const transferResponse = await fetch('/api/paystack/initiate-transfer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          source: 'balance',
          amount: parseInt(withdrawalForm.amount) * 100, // Convert to kobo
          recipient: recipientData.data.recipient_code,
          reason: withdrawalForm.reason || 'Withdrawal',
        }),
      });

      const transferData = await transferResponse.json();

      if (transferData.status) {
        addNotification('Withdrawal initiated successfully', 'success');
        // Reset form
        setWithdrawalForm({
          bankCode: '',
          accountNumber: '',
          accountName: '',
          amount: '',
          reason: '',
          eventId: ''
        });
      } else {
        addNotification(transferData.message || 'Transfer failed', 'error');
      }
    } catch (error) {
      console.error('Withdrawal error:', error);
      addNotification('Error processing withdrawal', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentVerification = async (e) => {
    e.preventDefault();
    if (!paymentReference.trim()) {
      addNotification('Please enter a payment reference', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/paystack/payments/confirm/${paymentReference}`);
      const data = await response.json();
      
      setPaymentVerificationResult(data);
      
      if (data.status === 200) {
        addNotification('Payment verified successfully', 'success');
      } else {
        addNotification(data.message || 'Payment verification failed', 'error');
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      addNotification('Error verifying payment', 'error');
      setPaymentVerificationResult({ status: 500, message: 'Network error' });
    } finally {
      setLoading(false);
    }
  };

  const selectedBank = banks.find(bank => bank.code === withdrawalForm.bankCode);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map(notif => (
          <div
            key={notif.id}
            className={`p-3 rounded-lg shadow-lg flex items-center space-x-2 ${
              notif.type === 'success' 
                ? 'bg-green-500 text-white' 
                : 'bg-red-500 text-white'
            }`}
          >
            {notif.type === 'success' ? <CheckCircle size={16} /> : <XCircle size={16} />}
            <span className="text-sm">{notif.message}</span>
          </div>
        ))}
      </div>

      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage withdrawals and verify payments</p>
          </div>

          {/* Tab Navigation */}
          <div className="border-b">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('withdrawals')}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  activeTab === 'withdrawals'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <DollarSign size={16} />
                  <span>Withdrawals</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('payments')}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  activeTab === 'payments'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <CreditCard size={16} />
                  <span>Payment Verification</span>
                </div>
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'withdrawals' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Initiate Withdrawal</h2>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Bank Selection */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Select Bank
                        </label>
                        <select
                          value={withdrawalForm.bankCode}
                          onChange={(e) => setWithdrawalForm(prev => ({
                            ...prev,
                            bankCode: e.target.value
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                          disabled={loadingBanks}
                        >
                          <option value="">
                            {loadingBanks ? 'Loading banks...' : 'Choose a bank'}
                          </option>
                          {banks.map((bank) => (
                            <option key={bank.code} value={bank.code}>
                              {bank.name}
                            </option>
                          ))}
                        </select>
                        {selectedBank && (
                          <p className="text-xs text-gray-500 mt-1">
                            Selected: {selectedBank.name}
                          </p>
                        )}
                      </div>

                      {/* Account Number */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Account Number
                        </label>
                        <input
                          type="text"
                          value={withdrawalForm.accountNumber}
                          onChange={(e) => setWithdrawalForm(prev => ({
                            ...prev,
                            accountNumber: e.target.value.replace(/\D/g, '')
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter account number"
                          required
                        />
                      </div>

                      {/* Account Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Account Name
                        </label>
                        <input
                          type="text"
                          value={withdrawalForm.accountName}
                          onChange={(e) => setWithdrawalForm(prev => ({
                            ...prev,
                            accountName: e.target.value
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Account holder name"
                          required
                        />
                      </div>

                      {/* Amount */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Amount (KES)
                        </label>
                        <input
                          type="number"
                          min="1"
                          step="0.01"
                          value={withdrawalForm.amount}
                          onChange={(e) => setWithdrawalForm(prev => ({
                            ...prev,
                            amount: e.target.value
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="0.00"
                          required
                        />
                      </div>
                    </div>

                    {/* Reason */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Reason (Optional)
                      </label>
                      <input
                        type="text"
                        value={withdrawalForm.reason}
                        onChange={(e) => setWithdrawalForm(prev => ({
                          ...prev,
                          reason: e.target.value
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Withdrawal reason"
                      />
                    </div>

                    {/* Event ID */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Event ID (Optional)
                      </label>
                      <input
                        type="text"
                        value={withdrawalForm.eventId}
                        onChange={(e) => setWithdrawalForm(prev => ({
                          ...prev,
                          eventId: e.target.value
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Related event ID"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleWithdrawalSubmit}
                      disabled={loading || loadingBanks}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                      {loading ? (
                        <>
                          <Loader className="animate-spin" size={16} />
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <DollarSign size={16} />
                          <span>Initiate Withdrawal</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {activeTab === 'payments' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Verification</h2>
                  
                  <form onSubmit={handlePaymentVerification} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Payment Reference
                      </label>
                      <input
                        type="text"
                        value={paymentReference}
                        onChange={(e) => setPaymentReference(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter payment reference (e.g., LsR5MMBqLIeMzAodG3tH)"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Enter the transaction reference from Paystack
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                      {loading ? (
                        <>
                          <Loader className="animate-spin" size={16} />
                          <span>Verifying...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle size={16} />
                          <span>Verify Payment</span>
                        </>
                      )}
                    </button>
                  </form>

                  {/* Payment Verification Result */}
                  {paymentVerificationResult && (
                    <div className="mt-6 p-4 border rounded-lg bg-gray-50">
                      <h3 className="font-medium text-gray-900 mb-3">Verification Result</h3>
                      
                      <div className={`p-3 rounded-md ${
                        paymentVerificationResult.status === 200 
                          ? 'bg-green-100 border border-green-200' 
                          : 'bg-red-100 border border-red-200'
                      }`}>
                        <div className="flex items-center space-x-2">
                          {paymentVerificationResult.status === 200 ? (
                            <CheckCircle className="text-green-600" size={16} />
                          ) : (
                            <XCircle className="text-red-600" size={16} />
                          )}
                          <span className={`font-medium ${
                            paymentVerificationResult.status === 200 
                              ? 'text-green-800' 
                              : 'text-red-800'
                          }`}>
                            {paymentVerificationResult.message}
                          </span>
                        </div>
                        
                        {paymentVerificationResult.type && (
                          <p className="text-sm text-gray-600 mt-1">
                            Type: {paymentVerificationResult.type}
                          </p>
                        )}
                        
                        <p className="text-sm text-gray-600 mt-1">
                          Status Code: {paymentVerificationResult.status}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* API Information */}
        <div className="mt-6 bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">API Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Withdrawal Endpoints</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <p>• GET /api/paystack/banks - Fetch available banks</p>
                <p>• POST /api/paystack/validate-account - Validate account</p>
                <p>• POST /api/paystack/create-recipient - Create recipient</p>
                <p>• POST /api/paystack/initiate-transfer - Initiate transfer</p>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Payment Verification</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <p>• GET /api/paystack/payments/confirm/[reference]</p>
                <p>• Webhook: POST /api/webhook</p>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <div className="flex items-start space-x-2">
              <AlertCircle className="text-yellow-600 mt-0.5" size={16} />
              <div className="text-sm text-yellow-800">
                <p className="font-medium">Note:</p>
                <p>Make sure you have the required API endpoints implemented on your backend for withdrawals to work properly. The payment verification uses your existing endpoint.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
