// components/StatusBadge.tsx
import React from 'react';
import { OrderStatus } from '../types';
import { STATUS_CONFIG } from '../constants';

interface StatusBadgeProps {
  status: OrderStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const config = STATUS_CONFIG[status];
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all ${config.color}`}
    >
      <span className="mr-1.5">{config.icon}</span>
      {config.label}
    </span>
  );
};