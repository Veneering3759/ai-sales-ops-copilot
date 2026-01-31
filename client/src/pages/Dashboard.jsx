import { useState, useEffect } from 'react';
import { getStats } from '../services/api';
import { BarChart3, Users, Upload, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const { data } = await getStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-slate-400">Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-4xl font-bold text-white mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          icon={<Users className="text-blue-400" size={24} />}
          label="Total Leads"
          value={stats?.totalLeads || 0}
        />
        <StatCard
          icon={<Upload className="text-purple-400" size={24} />}
          label="Imports"
          value={stats?.totalImports || 0}
        />
        <StatCard
          icon={<TrendingUp className="text-emerald-400" size={24} />}
          label="Average Score"
          value={Math.round(stats?.averageScore || 0)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <BarChart3 size={20} className="text-blue-400" />
            Score Distribution
          </h2>
          <div className="space-y-3">
            {stats?.scoreDistribution?.map((bucket, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <span className="text-slate-400 text-sm w-20">
                  {bucket._id === 0 ? '0-39' : 
                   bucket._id === 40 ? '40-59' :
                   bucket._id === 60 ? '60-79' : '80-100'}
                </span>
                <div className="flex-1 bg-slate-800 rounded-full h-6">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full flex items-center justify-end px-2"
                    style={{ width: `${(bucket.count / stats.totalLeads) * 100}%` }}
                  >
                    <span className="text-xs text-white font-medium">{bucket.count}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
          <h2 className="text-xl font-bold text-white mb-4">Top Industries</h2>
          <div className="space-y-3">
            {stats?.topIndustries?.map((industry, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <span className="text-slate-300 capitalize">{industry._id || 'Unknown'}</span>
                <span className="text-blue-400 font-medium">{industry.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-slate-800 rounded-lg">
          {icon}
        </div>
        <div>
          <p className="text-slate-500 text-sm">{label}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
        </div>
      </div>
    </div>
  );
}
