
import React from 'react';
import { useLoanContext } from '../context/LoanContext';
import { 
  LayoutDashboard, 
  Plus, 
  CreditCard, 
  Clock, 
  CheckCircle, 
  BarChart3, 
  Settings, 
  X,
  Users,
  FileText
} from 'lucide-react';

interface SidebarProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, setCurrentPage, isOpen, setIsOpen }) => {
  const { state } = useLoanContext();
  const brandColor = state.settings.brandColor;

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'issue-loan', label: 'Issue Loan', icon: Plus },
    { id: 'transactions', label: 'Transactions', icon: CreditCard },
    { id: 'running-loans', label: 'Running Loans', icon: Clock },
    { id: 'repaid-loans', label: 'Repaid Loans', icon: CheckCircle },
    { id: 'loanee-management', label: 'Loanee Management', icon: Users },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div 
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            {state.settings.logo && (
              <img 
                src={state.settings.logo} 
                alt="Logo" 
                className="w-8 h-8 object-contain"
              />
            )}
            <span className="text-lg font-semibold text-gray-900">{state.settings.companyName}</span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="mt-6 px-3">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              
              return (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      setCurrentPage(item.id);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                      isActive
                        ? 'text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    style={isActive ? { backgroundColor: brandColor } : {}}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 text-center">
            © 2024 {state.settings.companyName}
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;