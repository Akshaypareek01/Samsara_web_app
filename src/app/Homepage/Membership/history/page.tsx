'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import MembershipApiService, { Membership, Transaction } from '@/lib/membershipApiService';
import { ArrowLeft, Calendar, DollarSign, CreditCard, Tag } from 'lucide-react';

export default function MembershipHistoryPage() {
  const router = useRouter();
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'memberships' | 'transactions'>('memberships');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [membershipsData, transactionsData] = await Promise.all([
        MembershipApiService.getUserMemberships(),
        MembershipApiService.getUserTransactions(),
      ]);

      // Handle both direct array responses and wrapped responses
      setMemberships(
        Array.isArray(membershipsData) ? membershipsData : (membershipsData?.results || [])
      );
      setTransactions(
        Array.isArray(transactionsData) ? transactionsData : (transactionsData?.results || [])
      );

      console.log('Memberships loaded:', memberships);
      console.log('Transactions loaded:', transactions);
    } catch (error: any) {
      console.error('Error loading data:', error);
      toast.error(error.message || 'Failed to load membership history');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-500';
      case 'expired':
        return 'bg-red-500';
      case 'completed':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'failed':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const renderMembershipCard = (membership: Membership) => (
    <div key={membership._id} className="bg-white rounded-xl shadow-md p-6 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-800">{membership.planName}</h3>
        <span className={`${getStatusColor(membership.status)} text-white px-3 py-1 rounded-lg text-xs font-bold`}>
          {membership.status.toUpperCase()}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-gray-600 text-sm mb-1">Start Date</p>
          <p className="font-semibold text-gray-800 flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {new Date(membership.startDate).toLocaleDateString()}
          </p>
        </div>
        <div>
          <p className="text-gray-600 text-sm mb-1">End Date</p>
          <p className="font-semibold text-gray-800 flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {new Date(membership.endDate).toLocaleDateString()}
          </p>
        </div>
        <div>
          <p className="text-gray-600 text-sm mb-1">Amount Paid</p>
          <p className="font-semibold text-gray-800 flex items-center gap-1">
            <DollarSign className="w-4 h-4" />
            ₹{membership.amountPaid}
          </p>
        </div>
        {membership.couponCode && (
          <div>
            <p className="text-gray-600 text-sm mb-1">Coupon Used</p>
            <p className="font-semibold text-gray-800 flex items-center gap-1">
              <Tag className="w-4 h-4" />
              {membership.couponCode.code}
            </p>
          </div>
        )}
      </div>
    </div>
  );

  const renderTransactionCard = (transaction: Transaction) => (
    <div key={transaction._id} className="bg-white rounded-xl shadow-md p-6 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-800">{transaction.planName}</h3>
        <span className={`${getStatusColor(transaction.status)} text-white px-3 py-1 rounded-lg text-xs font-bold`}>
          {transaction.status.toUpperCase()}
        </span>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-600">Transaction ID:</span>
          <span className="font-semibold text-gray-800">{transaction.transactionId}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Amount:</span>
          <span className="font-semibold text-gray-800 flex items-center gap-1">
            <DollarSign className="w-4 h-4" />
            ₹{transaction.amount}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Payment Method:</span>
          <span className="font-semibold text-gray-800 flex items-center gap-1">
            <CreditCard className="w-4 h-4" />
            {transaction.paymentMethod}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Paid At:</span>
          <span className="font-semibold text-gray-800 flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {new Date(transaction.paidAt).toLocaleDateString()}
          </span>
        </div>
        {transaction.couponCode && (
          <div className="flex justify-between">
            <span className="text-gray-600">Coupon Used:</span>
            <span className="font-semibold text-gray-800 flex items-center gap-1">
              <Tag className="w-4 h-4" />
              {transaction.couponCode.code}
            </span>
          </div>
        )}
        {transaction.discountAmount > 0 && (
          <div className="flex justify-between">
            <span className="text-gray-600">Discount:</span>
            <span className="font-semibold text-green-600">-₹{transaction.discountAmount}</span>
          </div>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/Homepage/Membership"
            className="inline-flex items-center gap-2 text-orange-500 hover:text-orange-600 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Plans</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">Membership History</h1>
        </div>

        {/* Tabs */}
        <div className="flex bg-white rounded-xl shadow-md mb-6 overflow-hidden">
          <button
            onClick={() => setActiveTab('memberships')}
            className={`flex-1 py-4 text-center font-semibold transition-colors ${
              activeTab === 'memberships'
                ? 'bg-orange-500 text-white border-b-2 border-orange-500'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Memberships
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`flex-1 py-4 text-center font-semibold transition-colors ${
              activeTab === 'transactions'
                ? 'bg-orange-500 text-white border-b-2 border-orange-500'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Transactions
          </button>
        </div>

        {/* Content */}
        {activeTab === 'memberships' ? (
          <div>
            {memberships.length === 0 ? (
              <div className="bg-white rounded-xl p-8 text-center">
                <p className="text-gray-600 text-lg mb-4">No membership history found</p>
                <Link
                  href="/Homepage/Membership"
                  className="inline-block bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
                >
                  Explore Plans
                </Link>
              </div>
            ) : (
              memberships.map(renderMembershipCard)
            )}
          </div>
        ) : (
          <div>
            {transactions.length === 0 ? (
              <div className="bg-white rounded-xl p-8 text-center">
                <p className="text-gray-600 text-lg">No transaction history found</p>
              </div>
            ) : (
              transactions.map(renderTransactionCard)
            )}
          </div>
        )}
      </div>
    </div>
  );
}



