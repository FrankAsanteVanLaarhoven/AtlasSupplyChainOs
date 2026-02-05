import React from 'react';
import { Link2, CheckCircle, Clock, Lock, ArrowRight } from 'lucide-react';
import { ScrollArea } from '../components/ui/scroll-area';
import { Badge } from '../components/ui/badge';

const STATUS_CONFIG = {
  confirmed: {
    icon: CheckCircle,
    color: '#00FF41',
    bgColor: 'rgba(0, 255, 65, 0.1)',
    borderColor: 'rgba(0, 255, 65, 0.3)'
  },
  pending: {
    icon: Clock,
    color: '#FFB800',
    bgColor: 'rgba(255, 184, 0, 0.1)',
    borderColor: 'rgba(255, 184, 0, 0.3)'
  },
  processing: {
    icon: Clock,
    color: '#00F0FF',
    bgColor: 'rgba(0, 240, 255, 0.1)',
    borderColor: 'rgba(0, 240, 255, 0.3)'
  }
};

const TYPE_LABELS = {
  payment: 'Payment',
  settlement: 'Settlement',
  escrow: 'Escrow',
  contract: 'Smart Contract'
};

const TransactionRow = ({ transaction }) => {
  const status = STATUS_CONFIG[transaction.status] || STATUS_CONFIG.pending;
  const StatusIcon = status.icon;

  return (
    <div 
      data-testid={`blockchain-tx-${transaction.id}`}
      className="flex items-center gap-4 p-4 rounded-lg bg-black/30 border border-white/5 hover:border-cyan-500/20 transition-all group"
    >
      {/* Status Icon */}
      <div 
        className="p-2 rounded-lg"
        style={{ 
          backgroundColor: status.bgColor,
          border: `1px solid ${status.borderColor}`
        }}
      >
        <StatusIcon size={16} style={{ color: status.color }} />
      </div>

      {/* Transaction Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-white/40">{transaction.id}</span>
          <Badge 
            variant="outline" 
            className="text-[10px] uppercase tracking-wider"
            style={{ 
              borderColor: status.borderColor,
              color: status.color
            }}
          >
            {TYPE_LABELS[transaction.type] || transaction.type}
          </Badge>
        </div>
        
        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm text-white/80 truncate">{transaction.parties[0]}</span>
          <ArrowRight size={12} className="text-white/30 flex-shrink-0" />
          <span className="text-sm text-white/80 truncate">{transaction.parties[1]}</span>
        </div>
      </div>

      {/* Amount */}
      <div className="text-right">
        <p className="font-mono text-lg font-bold text-white">
          ${transaction.amount.toLocaleString()}
        </p>
        <p className="font-mono text-xs text-white/40">
          {new Date(transaction.timestamp).toLocaleTimeString()}
        </p>
      </div>

      {/* Hash */}
      <div className="hidden md:flex items-center gap-2">
        <Link2 size={12} className="text-cyan-500/50" />
        <span className="font-mono text-xs text-cyan-500/70 group-hover:text-cyan-400 transition-colors">
          {transaction.hash}
        </span>
      </div>
    </div>
  );
};

const BlockchainLedger = ({ transactions }) => {
  if (!transactions || transactions.length === 0) {
    return (
      <div 
        data-testid="blockchain-ledger-empty"
        className="nexus-widget flex items-center justify-center h-48"
      >
        <div className="text-center">
          <Lock size={32} className="mx-auto mb-3 text-white/20" />
          <p className="font-mono text-sm text-white/40">No blockchain transactions</p>
        </div>
      </div>
    );
  }

  // Calculate totals
  const totalVolume = transactions.reduce((sum, tx) => sum + tx.amount, 0);
  const confirmedCount = transactions.filter(tx => tx.status === 'confirmed').length;

  return (
    <div data-testid="blockchain-ledger" className="nexus-widget">
      <div className="widget-header">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
            <Link2 size={18} className="text-cyan-400" />
          </div>
          <div>
            <h3 className="widget-title">Blockchain Settlement Ledger</h3>
            <p className="text-xs font-mono text-white/40">Hyperledger Fabric Network</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs font-mono text-white/40 uppercase">24h Volume</p>
            <p className="font-mono text-lg font-bold text-cyan-400">
              ${totalVolume.toLocaleString()}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs font-mono text-white/40 uppercase">Confirmed</p>
            <p className="font-mono text-lg font-bold text-green-400">
              {confirmedCount}/{transactions.length}
            </p>
          </div>
        </div>
      </div>

      <ScrollArea className="h-64 mt-4">
        <div className="space-y-3 pr-4">
          {transactions.map((tx) => (
            <TransactionRow key={tx.id} transaction={tx} />
          ))}
        </div>
      </ScrollArea>

      <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="font-mono text-xs text-white/40">Network Active</span>
        </div>
        <button className="cyber-btn px-4 py-2 text-xs">
          View All Transactions
        </button>
      </div>
    </div>
  );
};

export default BlockchainLedger;
