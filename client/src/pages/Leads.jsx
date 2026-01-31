import { useState, useEffect } from 'react';
import { getLeads } from '../services/api';
import api from '../services/api'; // <-- use the configured axios instance (respects VITE_API_URL)
import { Search, Filter, Download, CheckSquare, Square } from 'lucide-react';

const EMPTY_PAGINATION = { total: 0, page: 1, pages: 1 };

export default function Leads() {
  const [data, setData] = useState({ leads: [], pagination: EMPTY_PAGINATION });
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    minScore: '',
    maxScore: '',
    seniority: '',
    status: ''
  });
  const [selectedLeads, setSelectedLeads] = useState(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, filters, data.pagination.page]);

  const loadLeads = async () => {
    setLoading(true);
    try {
      const params = { search, page: data.pagination.page };

      if (filters.minScore) params.minScore = filters.minScore;
      if (filters.maxScore) params.maxScore = filters.maxScore;
      if (filters.seniority) params.seniority = filters.seniority;
      if (filters.status) params.status = filters.status;

      const response = await getLeads(params);
      const payload = response?.data ?? {};

      setData({
        leads: Array.isArray(payload?.leads) ? payload.leads : [],
        pagination: payload?.pagination ?? EMPTY_PAGINATION
      });
    } catch (error) {
      console.error('Failed to load leads:', error);
      setData({ leads: [], pagination: EMPTY_PAGINATION });
    } finally {
      setLoading(false);
    }
  };

  const toggleLead = (id) => {
    const newSelected = new Set(selectedLeads);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedLeads(newSelected);
  };

  const toggleAll = () => {
    const leads = data?.leads ?? [];
    if (leads.length === 0) return;

    if (selectedLeads.size === leads.length) {
      setSelectedLeads(new Set());
    } else {
      setSelectedLeads(new Set(leads.map((l) => l._id)));
    }
  };

  const exportLeads = async (format) => {
    try {
      const leadIds = selectedLeads.size > 0 ? Array.from(selectedLeads) : null;

      // Use axios instance so it works on Vercel (no localhost hardcode)
      const res = await api.post(
        '/api/leads/export',
        { format, leadIds },
        { responseType: 'blob' }
      );

      const blob = new Blob([res.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `leads-${format}-${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      setShowExportMenu(false);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Check your API URL / backend deployment.');
    }
  };

  const leads = data?.leads ?? [];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold text-white">
          Leads{' '}
          {selectedLeads.size > 0 && (
            <span className="text-blue-400">({selectedLeads.size} selected)</span>
          )}
        </h1>

        <div className="flex gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg flex items-center gap-2 transition-colors"
          >
            <Filter size={20} />
            Filters
          </button>

          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg flex items-center gap-2 transition-colors"
            >
              <Download size={20} />
              Export {selectedLeads.size > 0 && `(${selectedLeads.size})`}
            </button>

            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-slate-800 rounded-lg shadow-xl border border-slate-700 z-10">
                <button
                  onClick={() => exportLeads('standard')}
                  className="w-full px-4 py-3 text-left text-white hover:bg-slate-700 rounded-t-lg"
                >
                  Standard CSV
                </button>
                <button
                  onClick={() => exportLeads('salesforce')}
                  className="w-full px-4 py-3 text-left text-white hover:bg-slate-700"
                >
                  Salesforce Format
                </button>
                <button
                  onClick={() => exportLeads('hubspot')}
                  className="w-full px-4 py-3 text-left text-white hover:bg-slate-700 rounded-b-lg"
                >
                  HubSpot Format
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {showFilters && (
        <div className="bg-slate-900 rounded-xl p-6 mb-6 border border-slate-800">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-2">Min Score</label>
              <input
                type="number"
                value={filters.minScore}
                onChange={(e) => setFilters({ ...filters, minScore: e.target.value })}
                placeholder="0"
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">Max Score</label>
              <input
                type="number"
                value={filters.maxScore}
                onChange={(e) => setFilters({ ...filters, maxScore: e.target.value })}
                placeholder="100"
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">Seniority</label>
              <select
                value={filters.seniority}
                onChange={(e) => setFilters({ ...filters, seniority: e.target.value })}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
              >
                <option value="">All</option>
                <option value="c-level">C-Level</option>
                <option value="vp">VP</option>
                <option value="director">Director</option>
                <option value="manager">Manager</option>
                <option value="individual">Individual</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
              >
                <option value="">All</option>
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="qualified">Qualified</option>
                <option value="converted">Converted</option>
              </select>
            </div>
          </div>
        </div>
      )}

      <div className="relative w-full mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
        <input
          type="text"
          placeholder="Search leads..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
        />
      </div>

      {loading ? (
        <div className="text-slate-400">Loading...</div>
      ) : (
        <>
          <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-800">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <button onClick={toggleAll} className="text-slate-400 hover:text-white">
                      {leads.length > 0 && selectedLeads.size === leads.length ? (
                        <CheckSquare size={20} />
                      ) : (
                        <Square size={20} />
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Company</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Title</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Score</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Next Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800">
                {leads.length === 0 ? (
                  <tr>
                    <td className="px-6 py-6 text-slate-400 text-sm" colSpan={7}>
                      No leads found.
                    </td>
                  </tr>
                ) : (
                  leads.map((lead) => (
                    <tr key={lead._id} className="hover:bg-slate-800/50">
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleLead(lead._id)}
                          className="text-slate-400 hover:text-white"
                        >
                          {selectedLeads.has(lead._id) ? (
                            <CheckSquare size={20} />
                          ) : (
                            <Square size={20} />
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-slate-300">{lead.email}</td>
                      <td className="px-6 py-4 text-slate-300">
                        {lead.firstName} {lead.lastName}
                      </td>
                      <td className="px-6 py-4 text-slate-300">{lead.company}</td>
                      <td className="px-6 py-4 text-slate-300">{lead.title}</td>
                      <td className="px-6 py-4">
                        <ScoreBadge score={Number(lead.score ?? 0)} />
                      </td>
                      <td className="px-6 py-4 text-slate-400 text-sm">{lead.nextBestAction}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-6">
            <div className="text-slate-400 text-sm">
              Showing {leads.length} of {data?.pagination?.total ?? 0} leads
            </div>
            <div className="flex gap-2">
              <button
                onClick={() =>
                  setData({
                    ...data,
                    pagination: { ...data.pagination, page: Math.max(1, data.pagination.page - 1) }
                  })
                }
                disabled={(data?.pagination?.page ?? 1) === 1}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg"
              >
                Previous
              </button>
              <button
                onClick={() =>
                  setData({
                    ...data,
                    pagination: { ...data.pagination, page: (data.pagination.page ?? 1) + 1 }
                  })
                }
                disabled={(data?.pagination?.page ?? 1) === (data?.pagination?.pages ?? 1)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function ScoreBadge({ score }) {
  let color = 'bg-slate-700 text-slate-300';
  if (score >= 80) color = 'bg-emerald-500 text-white';
  else if (score >= 60) color = 'bg-blue-500 text-white';
  else if (score >= 40) color = 'bg-yellow-500 text-white';

  return (
    <span className={`inline-flex items-center justify-center w-12 h-12 rounded-full font-bold ${color}`}>
      {Number.isFinite(score) ? score : 0}
    </span>
  );
}
