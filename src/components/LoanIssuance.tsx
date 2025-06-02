
import React, { useState } from 'react';
import { useLoanContext } from '../context/LoanContext';
import { Loan } from '../context/LoanContext';
import LoanForm from './LoanForm';
import { Search, Calendar } from 'lucide-react';

const LoanIssuance: React.FC = () => {
  const { state, dispatch } = useLoanContext();
  const [formData, setFormData] = useState({
    amount: '',
    loanType: '',
    repaymentPeriod: 'months' as 'months' | 'weeks' | 'days',
    repaymentPeriodValue: '',
    interestRate: state.settings.defaultInterestRate,
    totalInterest: '',
    selectedLoaneeId: '',
    loanee: {
      name: '',
      nationalId: '',
      mobile: '',
      email: '',
      employmentStatus: 'employed' as 'employed' | 'self-employed'
    },
    issuanceDate: new Date().toISOString().split('T')[0]
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loaneeSearchTerm, setLoaneeSearchTerm] = useState('');
  const [showLoaneeSearch, setShowLoaneeSearch] = useState(false);

  const filteredLoanees = (state.loanees || []).filter(loanee =>
    loanee.name.toLowerCase().includes(loaneeSearchTerm.toLowerCase()) ||
    loanee.nationalId.includes(loaneeSearchTerm) ||
    loanee.mobile.includes(loaneeSearchTerm)
  );

  const formatNumberWithCommas = (value: string) => {
    const number = value.replace(/[^\d]/g, '');
    return number.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const parseNumberFromString = (value: string) => {
    return parseInt(value.replace(/[^\d]/g, '')) || 0;
  };

  const calculateDueDate = () => {
    const issueDate = new Date(formData.issuanceDate);
    const periods = parseInt(formData.repaymentPeriodValue) || 0;
    
    switch (formData.repaymentPeriod) {
      case 'months':
        issueDate.setMonth(issueDate.getMonth() + periods);
        break;
      case 'weeks':
        issueDate.setDate(issueDate.getDate() + (periods * 7));
        break;
      case 'days':
        issueDate.setDate(issueDate.getDate() + periods);
        break;
    }
    
    return issueDate.toISOString().split('T')[0];
  };

  const calculateExpectedRepayment = () => {
    const amount = parseNumberFromString(formData.amount);
    const totalInterest = parseNumberFromString(formData.totalInterest);
    const periods = parseInt(formData.repaymentPeriodValue) || 1;
    
    return Math.round((amount + totalInterest) / periods);
  };

  const selectLoanee = (loanee: any) => {
    setFormData({
      ...formData,
      selectedLoaneeId: loanee.id,
      loanee: {
        name: loanee.name,
        nationalId: loanee.nationalId,
        mobile: loanee.mobile,
        email: loanee.email || '',
        employmentStatus: loanee.employmentStatus
      }
    });
    setShowLoaneeSearch(false);
    setLoaneeSearchTerm('');
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.amount) newErrors.amount = 'Loan amount is required';
    if (!formData.loanType) newErrors.loanType = 'Loan type is required';
    if (!formData.repaymentPeriodValue) newErrors.repaymentPeriodValue = 'Repayment period is required';
    if (!formData.totalInterest) newErrors.totalInterest = 'Total interest is required';
    if (!formData.loanee.name) newErrors.name = 'Loanee name is required';
    if (!formData.loanee.nationalId) newErrors.nationalId = 'National ID is required';
    if (!formData.loanee.mobile) newErrors.mobile = 'Mobile number is required';
    if (!formData.issuanceDate) newErrors.issuanceDate = 'Issuance date is required';

    // Check if issuance date is in the future
    const today = new Date().toISOString().split('T')[0];
    if (formData.issuanceDate > today) {
      newErrors.issuanceDate = 'Issuance date cannot be in the future';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const loanNumber = `${state.settings.companyName.replace(/\s+/g, '')}_Ln_${String(state.nextLoanNumber).padStart(3, '0')}`;
    const amount = parseNumberFromString(formData.amount);
    const totalInterest = parseNumberFromString(formData.totalInterest);
    
    const newLoan: Loan = {
      id: Date.now().toString(),
      loanNumber,
      issuanceDate: formData.issuanceDate,
      amount,
      loanType: formData.loanType,
      repaymentPeriod: formData.repaymentPeriod,
      repaymentPeriodValue: parseInt(formData.repaymentPeriodValue),
      dueDate: calculateDueDate(),
      expectedRepaymentAmount: calculateExpectedRepayment(),
      interestRate: formData.interestRate,
      totalInterest,
      principalBalance: amount,
      interestBalance: totalInterest,
      loanee: {
        ...formData.loanee,
        email: formData.loanee.email || undefined
      },
      status: 'running'
    };

    dispatch({ type: 'ADD_LOAN', payload: newLoan });
    
    // Reset form
    setFormData({
      amount: '',
      loanType: '',
      repaymentPeriod: 'months',
      repaymentPeriodValue: '',
      interestRate: state.settings.defaultInterestRate,
      totalInterest: '',
      selectedLoaneeId: '',
      loanee: {
        name: '',
        nationalId: '',
        mobile: '',
        email: '',
        employmentStatus: 'employed'
      },
      issuanceDate: new Date().toISOString().split('T')[0]
    });
    
    alert(`Loan ${loanNumber} issued successfully!`);
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{state.settings.companyName} - Issue New Loan</h1>
      
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
        {/* Loan Details */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Loan Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Issuance Date
              </label>
              <input
                type="date"
                value={formData.issuanceDate}
                max={today}
                onChange={(e) => setFormData({
                  ...formData,
                  issuanceDate: e.target.value
                })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                  errors.issuanceDate ? 'border-red-300' : 'border-gray-300'
                }`}
                required
              />
              {errors.issuanceDate && <p className="text-red-500 text-sm mt-1">{errors.issuanceDate}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loan Amount (KES)
              </label>
              <input
                type="text"
                value={formData.amount}
                onChange={(e) => setFormData({
                  ...formData,
                  amount: formatNumberWithCommas(e.target.value)
                })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                  errors.amount ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="100,000"
              />
              {errors.amount && <p className="text-red-500 text-sm mt-1">{errors.amount}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loan Type
              </label>
              <select
                value={formData.loanType}
                onChange={(e) => setFormData({
                  ...formData,
                  loanType: e.target.value
                })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                  errors.loanType ? 'border-red-300' : 'border-gray-300'
                }`}
                required
              >
                <option value="">Select loan type</option>
                {state.settings.loanTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              {errors.loanType && <p className="text-red-500 text-sm mt-1">{errors.loanType}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Interest Rate (%)
              </label>
              <input
                type="number"
                value={formData.interestRate}
                onChange={(e) => setFormData({
                  ...formData,
                  interestRate: parseFloat(e.target.value) || 0
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="15"
                step="0.1"
              />
            </div>

            <LoanForm
              loanType={formData.loanType}
              setLoanType={(type) => setFormData({ ...formData, loanType: type })}
              repaymentPeriod={formData.repaymentPeriod}
              setRepaymentPeriod={(period) => setFormData({ ...formData, repaymentPeriod: period as 'months' | 'weeks' | 'days' })}
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Repayment Period Value
                </label>
                <input
                  type="number"
                  value={formData.repaymentPeriodValue}
                  onChange={(e) => setFormData({
                    ...formData,
                    repaymentPeriodValue: e.target.value
                  })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                    errors.repaymentPeriodValue ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="12"
                />
                {errors.repaymentPeriodValue && <p className="text-red-500 text-sm mt-1">{errors.repaymentPeriodValue}</p>}
              </div>
            </LoanForm>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Interest Amount (KES)
              </label>
              <input
                type="text"
                value={formData.totalInterest}
                onChange={(e) => setFormData({
                  ...formData,
                  totalInterest: formatNumberWithCommas(e.target.value)
                })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                  errors.totalInterest ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="15,000"
              />
              {errors.totalInterest && <p className="text-red-500 text-sm mt-1">{errors.totalInterest}</p>}
            </div>
          </div>
        </div>

        {/* Loanee Selection */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Loanee Details</h2>
          
          {/* Loanee Search */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Existing Loanee (Optional)
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search loanees by name, ID, or mobile..."
                value={loaneeSearchTerm}
                onChange={(e) => {
                  setLoaneeSearchTerm(e.target.value);
                  setShowLoaneeSearch(e.target.value.length > 0);
                }}
                className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              
              {showLoaneeSearch && filteredLoanees.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {filteredLoanees.map((loanee) => (
                    <button
                      key={loanee.id}
                      type="button"
                      onClick={() => selectLoanee(loanee)}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="font-medium">{loanee.name}</div>
                      <div className="text-sm text-gray-500">ID: {loanee.nationalId} • Mobile: {loanee.mobile}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={formData.loanee.name}
                onChange={(e) => setFormData({
                  ...formData,
                  loanee: { ...formData.loanee, name: e.target.value }
                })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="John Doe"
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                National ID
              </label>
              <input
                type="text"
                value={formData.loanee.nationalId}
                onChange={(e) => setFormData({
                  ...formData,
                  loanee: { ...formData.loanee, nationalId: e.target.value }
                })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                  errors.nationalId ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="12345678"
              />
              {errors.nationalId && <p className="text-red-500 text-sm mt-1">{errors.nationalId}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mobile Number
              </label>
              <input
                type="tel"
                value={formData.loanee.mobile}
                onChange={(e) => setFormData({
                  ...formData,
                  loanee: { ...formData.loanee, mobile: e.target.value }
                })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                  errors.mobile ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="+254 700 000 000"
              />
              {errors.mobile && <p className="text-red-500 text-sm mt-1">{errors.mobile}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email (Optional)
              </label>
              <input
                type="email"
                value={formData.loanee.email}
                onChange={(e) => setFormData({
                  ...formData,
                  loanee: { ...formData.loanee, email: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="john@example.com"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Employment Status
              </label>
              <select
                value={formData.loanee.employmentStatus}
                onChange={(e) => setFormData({
                  ...formData,
                  loanee: { ...formData.loanee, employmentStatus: e.target.value as 'employed' | 'self-employed' }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="employed">Employed</option>
                <option value="self-employed">Self-Employed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Summary */}
        {formData.amount && formData.repaymentPeriodValue && formData.totalInterest && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-base font-semibold text-gray-900 mb-2">Loan Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Due Date:</span>
                <p className="font-semibold">{new Date(calculateDueDate()).toLocaleDateString()}</p>
              </div>
              <div>
                <span className="text-gray-600">Expected Periodic Repayment:</span>
                <p className="font-semibold">KES {calculateExpectedRepayment().toLocaleString()}</p>
              </div>
              <div>
                <span className="text-gray-600">Total Repayable:</span>
                <p className="font-semibold">
                  KES {(parseNumberFromString(formData.amount) + parseNumberFromString(formData.totalInterest)).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end pt-6">
          <button
            type="submit"
            className="bg-teal-600 text-white px-8 py-3 rounded-lg hover:bg-teal-700 transition-colors duration-200 font-semibold"
          >
            Issue Loan
          </button>
        </div>
      </form>
    </div>
  );
};

export default LoanIssuance;