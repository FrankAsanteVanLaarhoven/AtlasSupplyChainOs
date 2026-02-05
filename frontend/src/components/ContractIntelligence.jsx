import React, { useState } from 'react';
import { FileText, Plus, CheckCircle, Clock, AlertTriangle, DollarSign, Truck, Shield, Edit, Trash2, Send } from 'lucide-react';
import { ScrollArea } from '../components/ui/scroll-area';
import { Progress } from '../components/ui/progress';

// Contract templates
const CONTRACT_TEMPLATES = [
  { id: 't1', name: 'OTIF Performance', description: 'Payment based on on-time delivery rate', category: 'performance' },
  { id: 't2', name: 'Quality Guarantee', description: 'Penalties for defect rates above threshold', category: 'quality' },
  { id: 't3', name: 'Volume Commitment', description: 'Discounts for meeting volume targets', category: 'volume' },
  { id: 't4', name: 'Risk Sharing', description: 'Shared cost absorption during disruptions', category: 'risk' },
  { id: 't5', name: 'Sustainability Bonus', description: 'Rewards for ESG score improvements', category: 'esg' },
];

// Active smart contracts
const ACTIVE_CONTRACTS = [
  {
    id: 'sc-001',
    name: 'GreenMfg Performance Agreement',
    supplier: 'GreenMfg',
    status: 'active',
    type: 'OTIF Performance',
    conditions: [
      { metric: 'OTIF', operator: '>=', value: '99.5%', reward: '+$50,000', status: 'met' },
      { metric: 'OTIF', operator: '>=', value: '98%', reward: '+$25,000', status: 'met' },
      { metric: 'OTIF', operator: '<', value: '95%', penalty: '-$30,000', status: 'not_triggered' },
    ],
    currentOTIF: 99.2,
    nextSettlement: '2026-02-01',
    totalPaid: 125000,
    totalPenalties: 0,
    hash: '0x7f8a...3b2c'
  },
  {
    id: 'sc-002',
    name: 'Taiwan Mfg Quality Contract',
    supplier: 'Taiwan Mfg Co',
    status: 'warning',
    type: 'Quality Guarantee',
    conditions: [
      { metric: 'Defect Rate', operator: '<=', value: '0.5%', reward: '+$20,000', status: 'met' },
      { metric: 'Defect Rate', operator: '>', value: '1%', penalty: '-$40,000', status: 'not_triggered' },
      { metric: 'Defect Rate', operator: '>', value: '2%', penalty: 'Contract Termination', status: 'not_triggered' },
    ],
    currentDefectRate: 0.8,
    nextSettlement: '2026-01-25',
    totalPaid: 60000,
    totalPenalties: 0,
    hash: '0x9c4d...8e1f'
  },
  {
    id: 'sc-003',
    name: 'MexiSupply Volume Agreement',
    supplier: 'MexiSupply',
    status: 'active',
    type: 'Volume Commitment',
    conditions: [
      { metric: 'Monthly Volume', operator: '>=', value: '10,000 units', reward: '12% discount', status: 'met' },
      { metric: 'Monthly Volume', operator: '>=', value: '15,000 units', reward: '18% discount', status: 'not_triggered' },
      { metric: 'Monthly Volume', operator: '<', value: '5,000 units', penalty: 'Lose discount', status: 'not_triggered' },
    ],
    currentVolume: 12500,
    nextSettlement: '2026-02-15',
    totalSaved: 340000,
    hash: '0x2b5e...4a9c'
  },
];

// Settlement history
const SETTLEMENT_HISTORY = [
  { id: 'set-1', contract: 'GreenMfg Performance', date: '2026-01-15', amount: 50000, type: 'reward', status: 'completed' },
  { id: 'set-2', contract: 'Taiwan Mfg Quality', date: '2026-01-10', amount: 20000, type: 'reward', status: 'completed' },
  { id: 'set-3', contract: 'MexiSupply Volume', date: '2026-01-01', amount: 28000, type: 'discount', status: 'completed' },
  { id: 'set-4', contract: 'PacificTrade Risk Share', date: '2025-12-20', amount: -15000, type: 'penalty', status: 'completed' },
];

const StatusBadge = ({ status }) => {
  const config = {
    active: { color: '#00FF41', label: 'ACTIVE' },
    warning: { color: '#FFB800', label: 'WARNING' },
    breached: { color: '#FF003C', label: 'BREACHED' },
    pending: { color: '#00F0FF', label: 'PENDING' },
  };
  const { color, label } = config[status] || config.pending;
  
  return (
    <span 
      className="px-2 py-0.5 rounded text-[10px] font-mono uppercase"
      style={{ backgroundColor: `${color}15`, color, border: `1px solid ${color}30` }}
    >
      {label}
    </span>
  );
};

const ConditionRow = ({ condition }) => {
  const isMet = condition.status === 'met';
  const isPenalty = condition.penalty;
  
  return (
    <div className={`flex items-center justify-between p-2 rounded ${isMet ? 'bg-green-500/10' : 'bg-white/5'}`}>
      <div className="flex items-center gap-2">
        {isMet ? (
          <CheckCircle size={14} className="text-green-400" />
        ) : (
          <Clock size={14} className="text-white/40" />
        )}
        <span className="font-mono text-xs text-white/70">
          {condition.metric} {condition.operator} {condition.value}
        </span>
      </div>
      <span className={`font-mono text-xs ${isPenalty ? 'text-red-400' : 'text-green-400'}`}>
        {condition.reward || condition.penalty}
      </span>
    </div>
  );
};

const ContractCard = ({ contract, onSelect }) => {
  return (
    <div 
      data-testid={`contract-${contract.id}`}
      onClick={onSelect}
      className="p-4 rounded-lg bg-black/30 border border-white/10 hover:border-cyan-500/30 transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-heading text-sm font-semibold text-white">{contract.name}</h4>
          <p className="text-xs font-mono text-white/40">{contract.supplier}</p>
        </div>
        <StatusBadge status={contract.status} />
      </div>
      
      <div className="space-y-1 mb-3">
        {contract.conditions.slice(0, 2).map((cond, idx) => (
          <ConditionRow key={idx} condition={cond} />
        ))}
        {contract.conditions.length > 2 && (
          <p className="text-xs text-white/40 text-center">+{contract.conditions.length - 2} more conditions</p>
        )}
      </div>
      
      <div className="flex items-center justify-between pt-3 border-t border-white/5">
        <div className="flex items-center gap-2">
          <Clock size={12} className="text-white/40" />
          <span className="text-xs font-mono text-white/50">Next: {contract.nextSettlement}</span>
        </div>
        <span className="text-xs font-mono text-cyan-400">{contract.hash}</span>
      </div>
    </div>
  );
};

const ContractBuilder = ({ onClose }) => {
  const [step, setStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [conditions, setConditions] = useState([]);
  
  return (
    <div className="p-4 rounded-lg bg-black/40 border border-cyan-500/30">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-heading text-lg font-bold text-white">New Smart Contract</h4>
        <button onClick={onClose} className="text-white/40 hover:text-white">✕</button>
      </div>
      
      {/* Progress Steps */}
      <div className="flex items-center gap-2 mb-6">
        {[1, 2, 3].map(s => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-sm ${
              step >= s ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50' : 'bg-white/5 text-white/40 border border-white/10'
            }`}>
              {s}
            </div>
            {s < 3 && <div className={`w-12 h-0.5 ${step > s ? 'bg-cyan-500' : 'bg-white/10'}`} />}
          </div>
        ))}
      </div>
      
      {step === 1 && (
        <div>
          <p className="text-sm text-white/60 mb-3">Select a contract template:</p>
          <div className="grid grid-cols-2 gap-2">
            {CONTRACT_TEMPLATES.map(t => (
              <button
                key={t.id}
                onClick={() => { setSelectedTemplate(t); setStep(2); }}
                className={`p-3 rounded-lg text-left border transition-all ${
                  selectedTemplate?.id === t.id 
                    ? 'bg-cyan-500/10 border-cyan-500/50' 
                    : 'bg-white/5 border-white/10 hover:border-white/30'
                }`}
              >
                <p className="text-sm font-semibold text-white">{t.name}</p>
                <p className="text-xs text-white/50 mt-1">{t.description}</p>
              </button>
            ))}
          </div>
        </div>
      )}
      
      {step === 2 && (
        <div>
          <p className="text-sm text-white/60 mb-3">Define conditions for: {selectedTemplate?.name}</p>
          <div className="space-y-3">
            <div className="grid grid-cols-4 gap-2">
              <select className="col-span-1 p-2 rounded bg-black/50 border border-white/10 text-white text-sm">
                <option>OTIF</option>
                <option>Defect Rate</option>
                <option>Lead Time</option>
                <option>Volume</option>
              </select>
              <select className="p-2 rounded bg-black/50 border border-white/10 text-white text-sm">
                <option>&gt;=</option>
                <option>&lt;=</option>
                <option>&gt;</option>
                <option>&lt;</option>
              </select>
              <input type="text" placeholder="Value" className="p-2 rounded bg-black/50 border border-white/10 text-white text-sm" />
              <input type="text" placeholder="Reward/Penalty" className="p-2 rounded bg-black/50 border border-white/10 text-white text-sm" />
            </div>
            <button className="w-full py-2 rounded border border-dashed border-white/20 text-white/40 text-sm hover:border-cyan-500/50 hover:text-cyan-400 transition-colors">
              + Add Condition
            </button>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={() => setStep(1)} className="flex-1 py-2 rounded bg-white/5 text-white/60 text-sm">Back</button>
            <button onClick={() => setStep(3)} className="flex-1 py-2 rounded bg-cyan-500/20 text-cyan-400 text-sm">Next</button>
          </div>
        </div>
      )}
      
      {step === 3 && (
        <div>
          <p className="text-sm text-white/60 mb-3">Review and deploy contract</p>
          <div className="p-4 rounded-lg bg-black/30 border border-white/10 mb-4">
            <h5 className="font-mono text-sm text-cyan-400 mb-2">Contract Summary</h5>
            <p className="text-xs text-white/60">Template: {selectedTemplate?.name}</p>
            <p className="text-xs text-white/60">Conditions: 3 defined</p>
            <p className="text-xs text-white/60">Network: Hyperledger Fabric</p>
            <p className="text-xs text-white/60">Gas Fee: ~$2.50</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setStep(2)} className="flex-1 py-2 rounded bg-white/5 text-white/60 text-sm">Back</button>
            <button 
              onClick={onClose}
              className="flex-1 py-2 rounded bg-gradient-to-r from-cyan-500 to-slate-500 text-white text-sm font-semibold flex items-center justify-center gap-2"
            >
              <Send size={14} />
              Deploy Contract
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const ContractIntelligence = () => {
  const [selectedContract, setSelectedContract] = useState(null);
  const [showBuilder, setShowBuilder] = useState(false);
  const [activeTab, setActiveTab] = useState('contracts');

  // Calculate totals
  const totalValue = ACTIVE_CONTRACTS.reduce((sum, c) => sum + (c.totalPaid || c.totalSaved || 0), 0);
  const activeCount = ACTIVE_CONTRACTS.filter(c => c.status === 'active').length;

  return (
    <div data-testid="contract-intelligence" className="nexus-widget">
      <div className="widget-header mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-green-500/20 to-cyan-500/20 border border-green-500/30">
            <FileText size={18} className="text-green-400" />
          </div>
          <div>
            <h3 className="widget-title">Contract Intelligence</h3>
            <p className="text-xs font-mono text-white/40">Smart contract management • Blockchain</p>
          </div>
        </div>
        <button 
          onClick={() => setShowBuilder(true)}
          className="cyber-btn px-4 py-2 text-xs flex items-center gap-2"
        >
          <Plus size={14} />
          New Contract
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        <div className="p-3 rounded-lg bg-black/30 border border-white/5">
          <p className="text-xs font-mono text-white/40 uppercase">Active Contracts</p>
          <p className="text-xl font-mono font-bold text-green-400">{activeCount}</p>
        </div>
        <div className="p-3 rounded-lg bg-black/30 border border-white/5">
          <p className="text-xs font-mono text-white/40 uppercase">Total Value</p>
          <p className="text-xl font-mono font-bold text-cyan-400">${(totalValue / 1000).toFixed(0)}K</p>
        </div>
        <div className="p-3 rounded-lg bg-black/30 border border-white/5">
          <p className="text-xs font-mono text-white/40 uppercase">Settlements</p>
          <p className="text-xl font-mono font-bold text-white/60">{SETTLEMENT_HISTORY.length}</p>
        </div>
        <div className="p-3 rounded-lg bg-black/30 border border-white/5">
          <p className="text-xs font-mono text-white/40 uppercase">Compliance</p>
          <p className="text-xl font-mono font-bold text-white">98%</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {['contracts', 'settlements', 'templates'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-xs font-mono uppercase transition-all ${
              activeTab === tab 
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50' 
                : 'bg-white/5 text-white/40 border border-white/10'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {showBuilder ? (
        <ContractBuilder onClose={() => setShowBuilder(false)} />
      ) : (
        <ScrollArea className="h-[400px]">
          {activeTab === 'contracts' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pr-4">
              {ACTIVE_CONTRACTS.map(contract => (
                <ContractCard 
                  key={contract.id} 
                  contract={contract} 
                  onSelect={() => setSelectedContract(contract)}
                />
              ))}
            </div>
          )}
          
          {activeTab === 'settlements' && (
            <div className="space-y-2 pr-4">
              {SETTLEMENT_HISTORY.map(settlement => (
                <div 
                  key={settlement.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-black/30 border border-white/5"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      settlement.type === 'reward' ? 'bg-green-500/20' :
                      settlement.type === 'discount' ? 'bg-cyan-500/20' : 'bg-red-500/20'
                    }`}>
                      <DollarSign size={14} className={
                        settlement.type === 'reward' ? 'text-green-400' :
                        settlement.type === 'discount' ? 'text-cyan-400' : 'text-red-400'
                      } />
                    </div>
                    <div>
                      <p className="text-sm text-white">{settlement.contract}</p>
                      <p className="text-xs font-mono text-white/40">{settlement.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-mono font-bold ${settlement.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {settlement.amount > 0 ? '+' : ''}${Math.abs(settlement.amount).toLocaleString()}
                    </p>
                    <p className="text-xs font-mono text-white/40 uppercase">{settlement.type}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {activeTab === 'templates' && (
            <div className="grid grid-cols-2 gap-3 pr-4">
              {CONTRACT_TEMPLATES.map(template => (
                <div 
                  key={template.id}
                  className="p-4 rounded-lg bg-black/30 border border-white/10 hover:border-cyan-500/30 cursor-pointer transition-all"
                >
                  <h4 className="font-heading text-sm font-semibold text-white mb-1">{template.name}</h4>
                  <p className="text-xs text-white/50">{template.description}</p>
                  <div className="mt-3 pt-3 border-t border-white/5">
                    <span className="text-xs font-mono text-cyan-400 uppercase">{template.category}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      )}
    </div>
  );
};

export default ContractIntelligence;
