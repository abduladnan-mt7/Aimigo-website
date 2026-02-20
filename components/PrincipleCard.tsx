import React from 'react';
import { DesignPrinciple } from '../types';

interface PrincipleCardProps {
  principle: DesignPrinciple;
}

export const PrincipleCard: React.FC<PrincipleCardProps> = ({ principle }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8 hover:shadow-md transition-shadow duration-300 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <span className="text-3xl" role="img" aria-label={principle.title}>
          {principle.icon}
        </span>
        <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
          {principle.category}
        </span>
      </div>
      
      {/* Visual Hierarchy: Bold Heading */}
      <h3 className="text-xl font-bold text-primary mb-3">
        {principle.title}
      </h3>
      
      {/* Typography: Readable body text with good line height */}
      <p className="text-slate-600 leading-relaxed text-base flex-grow">
        {principle.description}
      </p>
    </div>
  );
};