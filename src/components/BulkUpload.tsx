
import React, { useState } from 'react';
import { useLoanContext } from '../context/LoanContext';
import { Upload, Download, FileText } from 'lucide-react';

interface BulkUploadProps {
  type: 'loans' | 'repayments';
}

const BulkUpload: React.FC<BulkUploadProps> = ({ type }) => {
  const { state, dispatch } = useLoanContext();
  const [isUploading, setIsUploading] = useState(false);

  const downloadTemplate = () => {
    let headers: string[];
    let sampleData: string[];

    if (type === 'loans') {
      headers = [
        'Loan Number',
        'Issuance Date',
        'Amount',
        'Loan Type',
        'Repayment Period Type',
        'Repayment Period Value',
        'Interest Rate',
        'Loanee Name',
        'National ID',
        'Mobile',
        'Email',
        'Employment Status'
      ];
      sampleData = [
        'JMS_LN_001',
        '2024-01-15',
        '50000',
        'Personal Loan',
        'months',
        '6',
        '15',
        'John Doe',
        '12345678',
        '0712345678',
        'john@email.com',
        'employed'
      ];
    } else {
      headers = [
        'Loan Number',
        'Payment Date',
        'Principal Amount',
        'Interest Amount',
        'Payer Name',
        'Payer National ID',
        'Payer Mobile',
        'Payment Channel'
      ];
      sampleData = [
        'JMS_LN_001',
        '2024-02-15',
        '8000',
        '1200',
        'John Doe',
        '12345678',
        '0712345678',
        'Mobile Money'
      ];
    }

    const csvContent = [headers, sampleData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${type}_upload_template.csv`;
    link.click();
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim());
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        
        if (type === 'loans') {
          // Process loan data
          const loanData = {
            id: Date.now().toString() + i,
            loanNumber: values[0],
            issuanceDate: values[1],
            amount: parseFloat(values[2]),
            loanType: values[3] || 'Personal Loan', // Add loanType field
            repaymentPeriod: values[4] as 'months' | 'weeks' | 'days',
            repaymentPeriodValue: parseInt(values[5]),
            interestRate: parseFloat(values[6]),
            totalInterest: (parseFloat(values[2]) * parseFloat(values[6]) / 100),
            principalBalance: parseFloat(values[2]),
            interestBalance: (parseFloat(values[2]) * parseFloat(values[6]) / 100),
            loanee: {
              name: values[7],
              nationalId: values[8],
              mobile: values[9],
              email: values[10],
              employmentStatus: values[11] as 'employed' | 'self-employed'
            },
            status: 'running' as const,
            dueDate: new Date(new Date(values[1]).getTime() + (parseInt(values[5]) * 30 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
            expectedRepaymentAmount: parseFloat(values[2]) + (parseFloat(values[2]) * parseFloat(values[6]) / 100)
          };

          dispatch({ type: 'ADD_LOAN', payload: loanData });
        } else {
          // Process repayment data
          const repaymentData = {
            id: Date.now().toString() + i,
            loanNumber: values[0],
            date: values[1],
            principalAmount: parseFloat(values[2]),
            interestAmount: parseFloat(values[3]),
            payer: {
              name: values[4],
              nationalId: values[5],
              mobile: values[6]
            },
            paymentChannel: values[7]
          };

          dispatch({ type: 'ADD_REPAYMENT', payload: repaymentData });
        }
      }

      alert(`Successfully uploaded ${lines.length - 1} ${type}`);
    } catch (error) {
      alert(`Error processing file: ${error}`);
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Upload className="w-5 h-5" />
        Bulk Upload {type === 'loans' ? 'Loans' : 'Repayments'}
      </h3>
      
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <button
            onClick={downloadTemplate}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Download Template
          </button>
          
          <div className="relative">
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileUpload}
              disabled={isUploading}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <button
              disabled={isUploading}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              <FileText className="w-4 h-4" />
              {isUploading ? 'Uploading...' : 'Upload File'}
            </button>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">Instructions:</h4>
          <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
            <li>Download the CSV template using the button above</li>
            <li>Fill in your data following the exact format shown</li>
            <li>Save your file as CSV format</li>
            <li>Upload your completed file</li>
          </ol>
          <p className="text-xs text-gray-500 mt-2">
            Supported formats: CSV, Excel (.xlsx, .xls)
          </p>
        </div>
      </div>
    </div>
  );
};

export default BulkUpload;