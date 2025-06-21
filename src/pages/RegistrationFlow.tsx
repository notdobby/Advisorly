import React, { useState, Fragment } from 'react';
import { ArrowRightIcon, ArrowLeftIcon, CheckCircleIcon, BrainCircuitIcon, WalletIcon, CalendarIcon, GlobeIcon, DollarSignIcon } from 'lucide-react';
import { supabase } from '../../frontend/supabaseClient';
import { useNavigate } from 'react-router-dom';

interface RegistrationFlowProps {
  onComplete: () => void;
}
const RegistrationFlow: React.FC<RegistrationFlowProps> = ({
  onComplete
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<{
    income: string;
    salaryDate: string;
    country: string;
    currency: string;
    budgetSplit: {
      needs: number;
      wants: number;
      savings: number;
    };
    [key: string]: any;
  }>({
    income: '',
    salaryDate: '',
    country: '',
    currency: 'USD',
    budgetSplit: {
      needs: 50,
      wants: 30,
      savings: 20
    }
  });
  const [error, setError] = useState('');
  const steps = [{
    title: 'Monthly Income',
    emoji: '💰',
    icon: <WalletIcon className="text-green-400" />,
    description: "Let's start with your monthly income after tax",
    field: 'income',
    type: 'number',
    placeholder: 'Enter your monthly income'
  }, {
    title: 'Salary Date',
    emoji: '📅',
    icon: <CalendarIcon className="text-blue-400" />,
    description: 'When do you usually receive your salary?',
    field: 'salaryDate',
    type: 'number',
    placeholder: 'Day of month (1-31)'
  }, {
    title: 'Country',
    emoji: '🌎',
    icon: <GlobeIcon className="text-purple-400" />,
    description: 'Which country are you based in?',
    field: 'country',
    type: 'text',
    placeholder: 'Enter your country'
  }, {
    title: 'Currency',
    emoji: '💱',
    icon: <DollarSignIcon className="text-yellow-400" />,
    description: 'Select your preferred currency',
    field: 'currency',
    type: 'select',
    options: [{
      value: 'USD',
      label: 'US Dollar ($)'
    }, {
      value: 'EUR',
      label: 'Euro (€)'
    }, {
      value: 'GBP',
      label: 'British Pound (£)'
    }, {
      value: 'INR',
      label: 'Indian Rupee (₹)'
    }, {
      value: 'JPY',
      label: 'Japanese Yen (¥)'
    }]
  }, {
    title: 'Budget Split',
    emoji: '📊',
    icon: <BrainCircuitIcon className="text-indigo-400" />,
    description: 'Our AI suggests this budget allocation',
    field: 'budgetSplit',
    type: 'sliders'
  }];
  const navigate = useNavigate();
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError('');
  };
  const handleSliderChange = (category: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      budgetSplit: {
        ...prev.budgetSplit,
        [category]: value
      }
    }));
  };
  const handleRegistrationComplete = async () => {
    console.log('handleRegistrationComplete called');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      console.log('Current user:', user);
      if (!user) return;
      const upsertObj = {
        id: user.id,
        name: user.user_metadata?.full_name || user.user_metadata?.name || '',
        email: user.email,
        income: Number(formData.income),
        salary_date: Number(formData.salaryDate),
        country: formData.country,
        currency: formData.currency
      };
      console.log('Upserting user:', upsertObj);
      const { data: userUpsert, error: userError } = await supabase
        .from('users')
        .upsert(upsertObj, { onConflict: 'id' });
      console.log('User upsert:', userUpsert, userError);
      // Create wallet allocations using custom budget split
      const { needs, wants, savings } = formData.budgetSplit;
      const allocations = [
        { category: 'Needs', percent: needs },
        { category: 'Wants', percent: wants },
        { category: 'Savings', percent: savings }
      ];
      for (const alloc of allocations) {
        const { data: walletUpsert, error: walletError } = await supabase.from('wallets').upsert({
          user_id: user.id,
          category: alloc.category,
          allocated_percent: alloc.percent,
          allocated_amount: Math.round((Number(formData.income) * alloc.percent) / 100),
          spent_amount: 0
        });
        console.log('Wallet upsert:', walletUpsert, walletError);
      }
      onComplete();
    } catch (err) {
      console.error('Registration error:', err);
    }
  };
  const handleNext = () => {
    console.log('Next clicked', { currentStep, formData });
    if (
      (currentStepData.field === 'income' && !formData.income) ||
      (currentStepData.field === 'salaryDate' && !formData.salaryDate) ||
      (currentStepData.field === 'country' && !formData.country)
    ) {
      setError('This field is required.');
      return;
    }
    setError('');
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleRegistrationComplete();
    }
  };
  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  const currentStepData = steps[currentStep];
  React.useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        // Redirect to login if not authenticated
        navigate('/');
      }
    });
  }, [navigate]);
  return <div className="min-h-screen flex flex-col items-center justify-center bg-[#0D1117] px-4">
      <div className="w-full max-w-md">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            {steps.map((_, index) => <Fragment key={index}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${index < currentStep ? 'bg-indigo-600 border-indigo-400 text-white' : index === currentStep ? 'bg-indigo-900 border-indigo-500 text-white' : 'bg-gray-900 border-gray-700 text-gray-500'}`}>
                  {index < currentStep ? <CheckCircleIcon size={16} /> : <span>{index + 1}</span>}
                </div>
                {index < steps.length - 1 && <div className={`flex-1 h-1 mx-2 rounded ${index < currentStep ? 'bg-indigo-600' : 'bg-gray-700'}`}></div>}
              </Fragment>)}
          </div>
        </div>
        {/* Card with glassmorphism effect */}
        <div className="relative bg-[#161B22]/80 backdrop-blur-md rounded-xl overflow-hidden shadow-2xl border border-gray-800">
          {/* Glowing edges */}
          <div className="absolute inset-0 rounded-xl overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500 to-transparent"></div>
            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-indigo-500 to-transparent"></div>
            <div className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-indigo-500 to-transparent"></div>
            <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-indigo-500 to-transparent"></div>
          </div>
          <div className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-indigo-900/50 flex items-center justify-center">
                {currentStepData.icon}
              </div>
              <h2 className="text-2xl font-bold text-white">
                {currentStepData.emoji} {currentStepData.title}
              </h2>
            </div>
            <p className="text-gray-400 mb-6">{currentStepData.description}</p>
            <div className="mb-8">
              {error && <div className="mb-4 text-red-400 text-sm font-medium">{error}</div>}
              {currentStepData.type === 'select' ? <div className="relative">
                  <select value={formData[currentStepData.field as keyof typeof formData]} onChange={e => handleInputChange(currentStepData.field, e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                    {(currentStepData.options ?? []).map((option: any) => <option key={option.value} value={option.value}>
                        {option.label}
                      </option>)}
                  </select>
                </div> : currentStepData.type === 'sliders' ? <div className="space-y-6">
                  <div className="relative">
                    <div className="flex justify-between mb-2">
                      <label className="text-sm text-gray-400">Needs</label>
                      <span className="text-sm font-medium text-white">
                        {formData.budgetSplit.needs}%
                      </span>
                    </div>
                    <input type="range" min="0" max="100" value={formData.budgetSplit.needs} onChange={e => handleSliderChange('needs', parseInt(e.target.value))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
                  </div>
                  <div className="relative">
                    <div className="flex justify-between mb-2">
                      <label className="text-sm text-gray-400">Wants</label>
                      <span className="text-sm font-medium text-white">
                        {formData.budgetSplit.wants}%
                      </span>
                    </div>
                    <input type="range" min="0" max="100" value={formData.budgetSplit.wants} onChange={e => handleSliderChange('wants', parseInt(e.target.value))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
                  </div>
                  <div className="relative">
                    <div className="flex justify-between mb-2">
                      <label className="text-sm text-gray-400">Savings</label>
                      <span className="text-sm font-medium text-white">
                        {formData.budgetSplit.savings}%
                      </span>
                    </div>
                    <input type="range" min="0" max="100" value={formData.budgetSplit.savings} onChange={e => handleSliderChange('savings', parseInt(e.target.value))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
                  </div>
                  <div className="flex items-center gap-2 mt-4 p-3 bg-indigo-900/30 rounded-lg border border-indigo-800/50">
                    <BrainCircuitIcon size={18} className="text-indigo-400" />
                    <span className="text-sm text-indigo-300">
                      🧠 AI Suggests: 50% Needs, 30% Wants, 20% Savings
                    </span>
                  </div>
                </div> : <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    {currentStepData.field === 'income' && <span className="text-gray-500">$</span>}
                  </div>
                  <input type="text" placeholder={currentStepData.placeholder} value={formData[currentStepData.field as keyof typeof formData] ?? ''} onChange={e => { console.log('Input changed', currentStepData.field, e.target.value); handleInputChange(currentStepData.field, e.target.value); }} className={`w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${currentStepData.field === 'income' ? 'pl-7' : ''}`} />
                </div>}
            </div>
            <div className="flex justify-between">
              <button onClick={handleBack} disabled={currentStep === 0} className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${currentStep === 0 ? 'text-gray-600 bg-gray-800/50 cursor-not-allowed' : 'text-white bg-gray-800 hover:bg-gray-700'}`}>
                <ArrowLeftIcon size={16} />
                Back
              </button>
              <button
                type="button"
                onClick={handleNext}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-colors bg-indigo-600 hover:bg-indigo-500 text-white`}
                style={{ zIndex: 9999, border: '2px solid red' }}
              >
                {currentStep === steps.length - 1 ? 'Complete' : 'Next'}
                <ArrowRightIcon size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>;
};
export default RegistrationFlow;