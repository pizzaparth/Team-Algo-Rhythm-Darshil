// Author: Parth Pancholi

import React from 'react';
import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import {
  ShieldCheck, GitBranch,
  User, Bot, Star, FileText, ChevronDown, ChevronUp,
  Users, CheckCircle2, HelpCircle, XCircle, Cpu, Loader2
} from 'lucide-react';
import { useGraphStore } from '../../store/';
import type { NodeData, NodeStatus } from '../../types';

const STATUS_BADGES: Record<NodeStatus, { bg: string; icon: React.ReactNode; label: string }> = {
  approved: { bg: 'bg-emerald-700', icon: <CheckCircle2 className="w-3 h-3 mr-1" />, label: 'Approved' },
  evaluated: { bg: 'bg-blue-700', icon: <ShieldCheck className="w-3 h-3 mr-1" />, label: 'Evaluated' },
  in_review: { bg: 'bg-amber-700', icon: <HelpCircle className="w-3 h-3 mr-1" />, label: 'In Review' },
  rejected: { bg: 'bg-rose-700', icon: <XCircle className="w-3 h-3 mr-1" />, label: 'Rejected' },
  proposed: { bg: 'bg-gray-700', icon: null, label: 'Proposed' },
};

function statusBadgeClasses(bg: string): string {
  return `inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${bg} text-white`;
}

export const DecisionNode: React.FC<NodeProps> = ({ id, data, selected }) => {
  const nodeData = data as unknown as NodeData;
  const { toggleNodeCollapse, toggleNodeBookmark, selectNode, searchHighlightIds, expandingNodeId } = useGraphStore();
  const isSearchHighlighted = searchHighlightIds.includes(id);
  const isExpanding = expandingNodeId === id;

  const getTypeStyle = () => {
    switch (nodeData.internalType) {
      case 'root':
        return { bg: 'bg-indigo-500/10', border: 'border-indigo-500', text: 'text-indigo-400', label: 'ROOT STRATEGY' };
      case 'strategic':
        return { bg: 'bg-blue-500/10', border: 'border-blue-500', text: 'text-blue-400', label: 'STRATEGIC OPTION' };
      case 'alternative':
        return { bg: 'bg-emerald-500/10', border: 'border-emerald-500', text: 'text-emerald-400', label: 'ALTERNATIVE' };
      case 'risk':
        return { bg: 'bg-rose-500/10', border: 'border-rose-500', text: 'text-rose-400', label: 'RISK FACTOR' };
      case 'prerequisite':
        return { bg: 'bg-amber-500/10', border: 'border-amber-500', text: 'text-amber-400', label: 'PREREQUISITE' };
      case 'outcome':
        return { bg: 'bg-purple-500/10', border: 'border-purple-500', text: 'text-purple-400', label: 'EXPECTED OUTCOME' };
      default:
        return { bg: 'bg-gray-500/10', border: 'border-gray-500', text: 'text-gray-400', label: 'DECISION NODE' };
    }
  };

  const getStatusBadge = () => {
    const badge = STATUS_BADGES[nodeData.status] ?? STATUS_BADGES.proposed;
    return (
      <span className={statusBadgeClasses(badge.bg)}>
        {badge.icon}
        {badge.label}
      </span>
    );
  };

  const typeStyle = getTypeStyle();

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        selectNode(id);
      }}
      className={`w-72 rounded-lg transition-all cursor-pointer relative overflow-hidden group ${
        selected 
          ? 'bg-[#1A1A1A] text-white border-2 border-[#1A1A1A] shadow-2xl scale-105 z-30' 
          : isSearchHighlighted
          ? 'bg-white text-[#1A1A1A] border-2 border-amber-400 shadow-[4px_4px_0px_0px_rgba(251,191,36,0.8)] ring-2 ring-amber-300 ring-offset-1'
          : 'bg-white text-[#1A1A1A] border-2 border-[#1A1A1A] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]'
      }`}
    >
      {/* LR Target Handle — LEFT side (input from parent) */}
      <Handle
        type="target"
        position={Position.Left}
        className={`!w-3 !h-3 !border-2 ${selected ? '!bg-white !border-[#1A1A1A]' : '!bg-[#1A1A1A] !border-white'}`}
      />

      {/* Top Branch Accent Bar */}
      <div 
        className="h-1.5 w-full" 
        style={{ backgroundColor: nodeData.branchColor || '#1A1A1A' }} 
      />

      {/* Node Header Row */}
      <div className={`p-3 pb-2 border-b flex items-center justify-between text-xs ${
        selected ? 'border-white/20' : 'border-[#E5E2DD]'
      }`}>
        <div className="flex items-center space-x-1.5">
          <span className={`px-2 py-0.5 rounded text-[9px] font-bold tracking-widest uppercase ${
            selected 
              ? 'bg-white/20 text-white border border-white/30' 
              : 'bg-[#F3F1ED] text-[#1A1A1A] border border-[#E5E2DD]'
          }`}>
            {typeStyle.label}
          </span>
          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
            selected ? 'bg-white/10 text-white/80' : 'bg-[#EEEBE6] text-[#1A1A1A]'
          }`}>
            L{nodeData.depth}
          </span>
        </div>

        <div className="flex items-center space-x-1">
          {/* Creator Tag */}
          <span className={`text-[10px] px-1.5 py-0.5 rounded flex items-center ${
            selected ? 'bg-white/10 text-white/80' : 'bg-[#F3F1ED] text-[#666666]'
          }`}>
            {nodeData.creator === 'ai' ? (
              <>
                <Bot className="w-2.5 h-2.5 mr-1" /> AI
              </>
            ) : (
              <>
                <User className="w-2.5 h-2.5 mr-1" /> User
              </>
            )}
          </span>

          {/* Bookmark Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleNodeBookmark(id);
            }}
            className={`p-1 rounded transition-colors ${
              selected ? 'text-white/80 hover:text-amber-300' : 'text-[#666666] hover:text-amber-600'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${nodeData.bookmarked ? 'text-amber-500 fill-amber-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* Node Body */}
      <div className="p-3.5 space-y-2">
        <h4 className={`font-serif italic text-base leading-tight line-clamp-2 ${
          selected ? 'text-white' : 'text-[#1A1A1A]'
        }`}>
          {nodeData.title}
        </h4>

        <p className={`text-[11px] line-clamp-2 leading-relaxed ${
          selected ? 'text-white/80' : 'text-[#666666]'
        }`}>
          {nodeData.summary}
        </p>

        {/* Status & Confidence Row */}
        <div className={`pt-2.5 border-t flex items-center justify-between text-[11px] ${
          selected ? 'border-white/20' : 'border-[#E5E2DD]'
        }`}>
          {getStatusBadge()}

          <div className="flex items-center space-x-1.5">
            {isExpanding && (
              <Loader2 className="w-3.5 h-3.5 text-indigo-500 animate-spin" title="AI expanding..." />
            )}
            <div className="w-8 h-8 rounded-full border-2 border-white bg-[#EEEBE6] flex items-center justify-center font-mono text-[10px] font-bold text-[#1A1A1A] shadow-sm relative z-10" title="AI Confidence Score">
              {nodeData.confidence}%
            </div>
          </div>
        </div>
      </div>

      {/* Footer Indicators */}
      <div className={`px-3 py-2 border-t flex items-center justify-between text-[10px] ${
        selected ? 'bg-black/30 border-white/20 text-white/80' : 'bg-[#F3F1ED] border-[#E5E2DD] text-[#666666]'
      }`}>
        <div className="flex items-center space-x-3">
          {/* Pros / Cons Count */}
          <span className="font-semibold">
            +{nodeData.pros?.length || 0} / -{nodeData.cons?.length || 0}
          </span>

          {/* Experts Count */}
          {nodeData.experts && nodeData.experts.length > 0 && (
            <span className="flex items-center" title="Expert references">
              <Users className="w-3 h-3 mr-0.5" />
              {nodeData.experts.length}
            </span>
          )}

          {/* Notes Indicator */}
          {nodeData.notes && (
            <span className="flex items-center" title="Contains notes">
              <FileText className="w-3 h-3" />
            </span>
          )}
        </div>

        {/* Collapse Chevron button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleNodeCollapse(id);
          }}
          className="p-1 rounded hover:opacity-100 transition-opacity"
          title={nodeData.collapsed ? 'Expand branch' : 'Collapse branch'}
        >
          {nodeData.displayType === 'Branch' ? <GitBranch className="w-3.5 h-3.5 mr-1 text-[#666666]" /> : <Cpu className="w-3.5 h-3.5 mr-1 text-[#666666]" />}
          <span>{nodeData.displayType.toUpperCase()}</span>
          {nodeData.collapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* LR Source Handle — RIGHT side (output to children) */}
      <Handle
        type="source"
        position={Position.Right}
        className={`!w-3 !h-3 !border-2 ${selected ? '!bg-white !border-[#1A1A1A]' : '!bg-[#1A1A1A] !border-white'}`}
      />
    </div>
  );
};
