import { useState } from 'react';
import { BrainCircuitIcon, ArrowRightIcon, TrendingUpIcon, TrendingDownIcon, AlertTriangleIcon, CheckCircleIcon, InfoIcon, XIcon } from 'lucide-react';
const AISuggestionsPage = () => {
  const [dismissedSuggestions, setDismissedSuggestions] = useState<string[]>([]);
  const suggestions = [{
    id: 's1',
    type: 'transfer',
    title: 'Move $200 from Wants to Savings',
    description: 'Based on your spending patterns, you can increase your savings rate without impacting your lifestyle.',
    impact: 'High',
    icon: <TrendingUpIcon size={20} />,
    color: 'green',
    reason: "Your 'Wants' category has consistently been underspent by ~$200 for the past 3 months."
  }, {
    id: 's2',
    type: 'reduce',
    title: 'Reduce Dining budget by 10%',
    description: 'Your dining expenses are consistently lower than budgeted.',
    impact: 'Medium',
    icon: <TrendingDownIcon size={20} />,
    color: 'yellow',
    reason: "You've only used 75% of your dining budget on average over the last 4 months."
  }, {
    id: 's3',
    type: 'alert',
    title: 'Grocery spending trending higher',
    description: 'You may exceed your grocery budget this month based on current spending.',
    impact: 'High',
    icon: <AlertTriangleIcon size={20} />,
    color: 'red',
    reason: 'Your grocery spending is 15% higher than the same period last month.'
  }, {
    id: 's4',
    type: 'tip',
    title: 'Set up automatic transfers to savings',
    description: 'Automate your savings to build wealth consistently.',
    impact: 'Long-term',
    icon: <InfoIcon size={20} />,
    color: 'blue',
    reason: 'Studies show automatic savers accumulate 2x more wealth over time than manual savers.'
  }, {
    id: 's5',
    type: 'achievement',
    title: "You've maintained your emergency fund!",
    description: 'Your emergency fund has been fully funded for 3 consecutive months.',
    impact: 'Positive',
    icon: <CheckCircleIcon size={20} />,
    color: 'green',
    reason: 'Financial experts recommend keeping 3-6 months of expenses in an emergency fund.'
  }];
  const activeSuggestions = suggestions.filter(suggestion => !dismissedSuggestions.includes(suggestion.id));
  const handleDismiss = (id: string) => {
    setDismissedSuggestions(prev => [...prev, id]);
  };
  const getIconBackground = (color: string) => {
    switch (color) {
      case 'green':
        return 'bg-green-900/30 text-green-400';
      case 'yellow':
        return 'bg-yellow-900/30 text-yellow-400';
      case 'red':
        return 'bg-red-900/30 text-red-400';
      case 'blue':
        return 'bg-blue-900/30 text-blue-400';
      default:
        return 'bg-indigo-900/30 text-indigo-400';
    }
  };
  const getCardBorder = (color: string) => {
    switch (color) {
      case 'green':
        return 'border-green-800/50';
      case 'yellow':
        return 'border-yellow-800/50';
      case 'red':
        return 'border-red-800/50';
      case 'blue':
        return 'border-blue-800/50';
      default:
        return 'border-indigo-800/50';
    }
  };
  const getRibbonColor = (color: string) => {
    switch (color) {
      case 'green':
        return 'bg-green-500';
      case 'yellow':
        return 'bg-yellow-500';
      case 'red':
        return 'bg-red-500';
      case 'blue':
        return 'bg-blue-500';
      default:
        return 'bg-indigo-500';
    }
  };
  return <div className="min-h-full bg-[#0D1117] text-white p-4 md:p-8">
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-indigo-900/50 flex items-center justify-center">
            <BrainCircuitIcon size={20} className="text-indigo-400" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold">AI Suggestions</h1>
        </div>
        <p className="text-gray-400">
          Smart financial insights based on your spending patterns
        </p>
      </header>
      {activeSuggestions.length === 0 ? <div className="flex flex-col items-center justify-center py-16 text-gray-500">
          <BrainCircuitIcon size={48} className="mb-4 opacity-50" />
          <p className="text-xl font-medium mb-2">No active suggestions</p>
          <p className="text-sm">Check back later for new financial insights</p>
        </div> : <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {activeSuggestions.map(suggestion => <div key={suggestion.id} className={`relative bg-[#161B22] rounded-xl overflow-hidden border ${getCardBorder(suggestion.color)} group`}>
              {/* Colored ribbon */}
              <div className={`absolute top-0 left-6 w-2 h-12 ${getRibbonColor(suggestion.color)}`}></div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-4">
                    <div className={`w-10 h-10 rounded-full ${getIconBackground(suggestion.color)} flex items-center justify-center`}>
                      {suggestion.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-400">
                          {suggestion.impact} Impact
                        </span>
                      </div>
                      <h3 className="font-medium text-lg">
                        {suggestion.title}
                      </h3>
                    </div>
                  </div>
                  <button onClick={() => handleDismiss(suggestion.id)} className="p-1 text-gray-500 hover:text-gray-300">
                    <XIcon size={16} />
                  </button>
                </div>
                <p className="text-gray-400 mb-4">{suggestion.description}</p>
                <div className="mb-4">
                  <button className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1" onClick={() => {
                    // TODO: Implement show reason functionality
                    console.log('Show reason for:', suggestion.title);
                  }}>
                    <span>Show me why</span>
                    <ArrowRightIcon size={14} />
                  </button>
                </div>
                <div className="bg-gray-900/50 p-3 rounded-lg text-sm text-gray-400 max-h-0 overflow-hidden opacity-0 group-hover:max-h-40 group-hover:opacity-100 transition-all duration-300 ease-in-out">
                  {suggestion.reason}
                </div>
              </div>
            </div>)}
        </div>}
      {/* Financial Tips Section */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold mb-6">Financial Wisdom</h2>
        <div className="bg-[#161B22] rounded-xl p-6 border border-gray-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-blue-900/30 flex items-center justify-center">
              <InfoIcon size={20} className="text-blue-400" />
            </div>
            <div>
              <h3 className="font-medium">The 50/30/20 Rule</h3>
              <p className="text-sm text-gray-400">Financial principle</p>
            </div>
          </div>
          <blockquote className="border-l-2 border-blue-500 pl-4 py-1 mb-4">
            <p className="text-gray-300 italic">
              "Allocate 50% of your budget to needs, 30% to wants, and 20% to
              savings and debt repayment."
            </p>
            <footer className="text-sm text-gray-500 mt-2">
              — Elizabeth Warren, financial expert
            </footer>
          </blockquote>
          <p className="text-sm text-gray-400">
            This simple budgeting method helps ensure you cover essentials,
            enjoy life, and build financial security.
          </p>
        </div>
      </section>
    </div>;
};
export default AISuggestionsPage;