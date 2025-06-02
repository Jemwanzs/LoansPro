
import React, { useState } from 'react';
import { useLoanContext } from '../context/LoanContext';

const Reports: React.FC = () => {
  const { state } = useLoanContext();
  const [reportPeriod, setReportPeriod] = useState('this-month');
  const [customDateRange, setCustomDateRange] = useState({
    start: '',
    end: ''
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount).replace('$', 'KES ');
  };

  const getDateRange = () => {
    const today = new Date();
    let startDate = new Date();
    let endDate = new Date();

    switch (reportPeriod) {
      case 'this-month':
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        break;
      case 'last-3-months':
        startDate = new Date(today.getFullYear(), today.getMonth() - 2, 1);
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        break;
      case 'last-6-months':
        startDate = new Date(today.getFullYear(), today.getMonth() - 5, 1);
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        break;
      case 'ytd':
        startDate = new Date(today.getFullYear(), 0, 1);
        endDate = today;
        break;
      case 'custom':
        startDate = customDateRange.start ? new Date(customDateRange.start) : new Date();
        endDate = customDateRange.end ? new Date(customDateRange.end) : new Date();
        break;
      default:
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    }

    return { startDate, endDate };
  };

  const calculateReportMetrics = () => {
    const { startDate, endDate } = getDateRange();
    const loans = (state.loans || []).filter(loan => {
      const loanDate = new Date(loan.issuanceDate);
      return loanDate >= startDate && loanDate <= endDate;
    });

    const repayments = (state.repayments || []).filter(repayment => {
      const repaymentDate = new Date(repayment.date);
      return repaymentDate >= startDate && repaymentDate <= endDate;
    });

    const totalPrincipalIssued = loans.reduce((sum, loan) => sum + loan.amount, 0);
    const totalInterestCharged = loans.reduce((sum, loan) => sum + loan.totalInterest, 0);
    const totalOutstandingPrincipal = loans.reduce((sum, loan) => sum + loan.principalBalance, 0);
    const totalOutstandingInterest = loans.reduce((sum, loan) => sum + loan.interestBalance, 0);
    const totalPrincipalRepaid = repayments.reduce((sum, repayment) => sum + repayment.principalAmount, 0);
    const totalInterestRepaid = repayments.reduce((sum, repayment) => sum + repayment.interestAmount, 0);

    return {
      totalPrincipalIssued,
      totalInterestCharged,
      totalOutstandingPrincipal,
      totalOutstandingInterest,
      totalPrincipalRepaid,
      totalInterestRepaid,
      loansCount: loans.length,
      repaymentsCount: repayments.length
    };
  };

  const exportToPDF = () => {
    // This would implement PDF export functionality
    alert('PDF export functionality will be implemented');
  };

  const exportToExcel = () => {
    // This would implement Excel export functionality
    alert('Excel export functionality will be implemented');
  };

  const metrics = calculateReportMetrics();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
        <div className="flex gap-2">
          <button
            onClick={exportToPDF}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Export PDF
          </button>
          <button
            onClick={exportToExcel}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Export Excel
          </button>
        </div>
      </div>

      {/* Period Selection */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Report Period</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
          <button
            onClick={() => setReportPeriod('this-month')}
            className={`px-4 py-2 rounded-lg border transition-colors ${
              reportPeriod === 'this-month'
                ? 'border-brand-primary text-white'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
            style={reportPeriod === 'this-month' ? { backgroundColor: `hsl(var(--brand-primary))` } : {}}
          >
            This Month
          </button>
          <button
            onClick={() => setReportPeriod('last-3-months')}
            className={`px-4 py-2 rounded-lg border transition-colors ${
              reportPeriod === 'last-3-months'
                ? 'border-brand-primary text-white'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
            style={reportPeriod === 'last-3-months' ? { backgroundColor: `hsl(var(--brand-primary))` } : {}}
          >
            Last 3 Months
          </button>
          <button
            onClick={() => setReportPeriod('last-6-months')}
            className={`px-4 py-2 rounded-lg border transition-colors ${
              reportPeriod === 'last-6-months'
                ? 'border-brand-primary text-white'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
            style={reportPeriod === 'last-6-months' ? { backgroundColor: `hsl(var(--brand-primary))` } : {}}
          >
            Last 6 Months
          </button>
          <button
            onClick={() => setReportPeriod('ytd')}
            className={`px-4 py-2 rounded-lg border transition-colors ${
              reportPeriod === 'ytd'
                ? 'border-brand-primary text-white'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
            style={reportPeriod === 'ytd' ? { backgroundColor: `hsl(var(--brand-primary))` } : {}}
          >
            Year to Date
          </button>
          <button
            onClick={() => setReportPeriod('custom')}
            className={`px-4 py-2 rounded-lg border transition-colors ${
              reportPeriod === 'custom'
                ? 'border-brand-primary text-white'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
            style={reportPeriod === 'custom' ? { backgroundColor: `hsl(var(--brand-primary))` } : {}}
          >
            Custom Range
          </button>
        </div>

        {reportPeriod === 'custom' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                value={customDateRange.start}
                onChange={(e) => setCustomDateRange({ ...customDateRange, start: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                value={customDateRange.end}
                onChange={(e) => setCustomDateRange({ ...customDateRange, end: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
              />
            </div>
          </div>
        )}
      </div>

      {/* Report Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Principal Issued</h3>
          <p className="text-3xl font-bold" style={{ color: `hsl(var(--brand-primary))` }}>
            {formatCurrency(metrics.totalPrincipalIssued)}
          </p>
          <p className="text-sm text-gray-600">{metrics.loansCount} loans</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Interest Charged</h3>
          <p className="text-3xl font-bold text-green-600">
            {formatCurrency(metrics.totalInterestCharged)}
          </p>
          <p className="text-sm text-gray-600">Total interest</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Outstanding Principal</h3>
          <p className="text-3xl font-bold text-orange-600">
            {formatCurrency(metrics.totalOutstandingPrincipal)}
          </p>
          <p className="text-sm text-gray-600">Remaining balance</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Outstanding Interest</h3>
          <p className="text-3xl font-bold text-red-600">
            {formatCurrency(metrics.totalOutstandingInterest)}
          </p>
          <p className="text-sm text-gray-600">Interest due</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Principal Repaid</h3>
          <p className="text-3xl font-bold text-blue-600">
            {formatCurrency(metrics.totalPrincipalRepaid)}
          </p>
          <p className="text-sm text-gray-600">{metrics.repaymentsCount} payments</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Interest Repaid</h3>
          <p className="text-3xl font-bold text-indigo-600">
            {formatCurrency(metrics.totalInterestRepaid)}
          </p>
          <p className="text-sm text-gray-600">Interest collected</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Outstanding</h3>
          <p className="text-3xl font-bold text-gray-900">
            {formatCurrency(metrics.totalOutstandingPrincipal + metrics.totalOutstandingInterest)}
          </p>
          <p className="text-sm text-gray-600">All balances</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Collection Rate</h3>
          <p className="text-3xl font-bold text-teal-600">
            {metrics.totalPrincipalIssued > 0 
              ? ((metrics.totalPrincipalRepaid / metrics.totalPrincipalIssued) * 100).toFixed(1)
              : '0'
            }%
          </p>
          <p className="text-sm text-gray-600">Principal recovered</p>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Period Summary</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2">Metric</th>
                <th className="text-right py-2">Amount</th>
                <th className="text-right py-2">Count</th>
              </tr>
            </thead>
            <tbody className="space-y-2">
              <tr className="border-b border-gray-100">
                <td className="py-2">Principal Issued</td>
                <td className="text-right py-2">{formatCurrency(metrics.totalPrincipalIssued)}</td>
                <td className="text-right py-2">{metrics.loansCount}</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2">Interest Charged</td>
                <td className="text-right py-2">{formatCurrency(metrics.totalInterestCharged)}</td>
                <td className="text-right py-2">-</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2">Principal Repaid</td>
                <td className="text-right py-2">{formatCurrency(metrics.totalPrincipalRepaid)}</td>
                <td className="text-right py-2">{metrics.repaymentsCount}</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2">Interest Repaid</td>
                <td className="text-right py-2">{formatCurrency(metrics.totalInterestRepaid)}</td>
                <td className="text-right py-2">-</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 font-semibold">Net Outstanding</td>
                <td className="text-right py-2 font-semibold">
                  {formatCurrency(metrics.totalOutstandingPrincipal + metrics.totalOutstandingInterest)}
                </td>
                <td className="text-right py-2">-</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;