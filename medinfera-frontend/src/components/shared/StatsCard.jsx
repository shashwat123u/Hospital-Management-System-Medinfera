import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card } from '../ui/Card';

export const StatsCard = ({ title, value, subtitle, icon: Icon, trend, trendValue, color = 'primary' }) => {
  const colorMap = {
    primary: 'bg-primary-50 text-primary-600',
    success: 'bg-emerald-50 text-emerald-600',
    warning: 'bg-amber-50 text-amber-600',
    danger: 'bg-red-50 text-red-600',
    info: 'bg-blue-50 text-blue-600',
  };

  return (
    <Card className="overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl ${colorMap[color]}`}>
            <Icon className="w-6 h-6" />
          </div>
          {trend && (
            <div className={`flex items-center text-sm font-medium ${trend === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
              {trend === 'up' ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
              {trendValue}
            </div>
          )}
        </div>
        <div>
          <h3 className="text-3xl font-bold text-slate-900 mb-1">{value}</h3>
          <p className="text-sm font-medium text-slate-600">{title}</p>
          {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
        </div>
      </div>
    </Card>
  );
};
