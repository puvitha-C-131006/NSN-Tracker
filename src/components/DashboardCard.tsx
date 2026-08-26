import type { ReactNode } from 'react';

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: string;
  trendUp?: boolean;
}

export default function DashboardCard({ title, value, icon, trend, trendUp }: DashboardCardProps) {
  return (
    <div className="card bg-white shadow-md flex flex-col justify-between transition-transform hover:-translate-y-1 hover:shadow-lg duration-300 gap-4">
      <div className="flex items-center justify-between">
        <h3 className="card-title text-gray-600 font-semibold">{title}</h3>
        <div className="card-icon-badge flex items-center justify-center bg-primary-50 rounded-full text-primary-600">
          {icon}
        </div>
      </div>
      <div>
        <p className="card-value font-bold text-gray-900 mb-1">{value}</p>
        {trend && (
          <p className={`card-subtext font-semibold ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
            {trend}
          </p>
        )}
      </div>
    </div>
  );
}
