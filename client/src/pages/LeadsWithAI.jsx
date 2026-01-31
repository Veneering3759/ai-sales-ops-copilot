import { useEffect, useMemo, useState } from 'react';
import { getLeads, generateEmail as apiGenerateEmail } from '../services/api';
import { Search, Sparkles, X, Copy, Check } from 'lucide-react';

const EMPTY_PAGINATION = { total: 0, page: 1, pages: 1 };

export default function LeadsWithAI() {
  const [data, setData] = useState({ leads: [], pagination: EMPTY_PAGINATION });
  const [search, setSearch] = useState('');
  const [selectedLead, setSelectedLead] = useState(null);
  const [generatingEmail, setGeneratingEmail] = useState(false);
  const [generatedEmail, setGeneratedEmail] = useState('');
  const [emailType, setEmailType] = useState('cold');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const loadLeads = async () => {
    setLoading(true);
    try {
      const response = await getLeads({ search, page: 1 });

      // Supports both axios (response.data) and direct response
      const payload = response?.data ?? response;

      // Backend returns {leads: [...], pagination: {...}}
      const leads = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.leads)
          ? payload.leads
          : [];

      const pagination =
        !Array.isArray(payload) && payload?.pagination
          ? payload.pagination
          : { total: leads.length, page: 1, pages: 1 };

      setData({ leads, pagination });
    } catch (error) {
      console.error('Failed to load leads:', error);
      setData({ leads: [], pagination: EMPTY_PAGINATION });
    } finally {
      setLoading(false);
    }
  };

  const generateEmail = async (lead, type) => {
    setGeneratingEmail(true);
    setGeneratedEmail('');
    setCopied(false);

    try {
      const response = await apiGenerateEmail(lead, type);
      const email = response?.data?.email || response?.email || 'No email returned.';
      setGeneratedEmail(email);
    } catch (error) {
      console.error('Failed to generate email:', error);
      setGeneratedEmail(error?.response?.data?.message || error?.message || 'Error generating email. Please try again.');
    } finally {
      setGeneratingEmail(false);
    }
  };

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(generatedEmail);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy to clipboard:', e);
    }
  };

  const openEmailModal = (lead) => {
    setSelectedLead(lead);
    setGeneratedEmail('');
    generateEmail(lead, emailType);
  };

  const closeModal = () => {
    setSelectedLead(null);
    setGeneratedEmail('');
    setGeneratingEmail(false);
    setCopied(false);
  };

  const leads = useMemo(() => data?.leads ?? [], [data]);
  const total = data?.pagination?.total ?? leads.length;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold text-white flex items-center gap-3">
          <Sparkles className="text-blue-400" size={36} />
          AI-Powered Leads
        </h1>

        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 rounded-lg">
          <p className="text-white text-sm font-semibold">✨ AI Features Active</p>
        </div>
      </div>

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
        <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
          {/* FIXED: Added responsive wrapper */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-slate-800">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Company</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Title</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Score</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">AI Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800">
                {leads.length === 0 ? (
                  <tr>
                    <td className="px-6 py-6 text-slate-400 text-sm" colSpan={6}>
                      No leads found.
                    </td>
                  </tr>
                ) : (
                  leads.slice(0, 10).map((lead) => (
                    <tr key={lead?._id ?? `${lead?.email}-${lead?.company}`} className="hover:bg-slate-800/50">
                      <td className="px-6 py-4 text-slate-300 text-sm">{lead?.email ?? '-'}</td>
                      <td className="px-6 py-4 text-slate-300">
                        {(lead?.firstName ?? '')} {(lead?.lastName ?? '')}
                      </td>
                      <td className="px-6 py-4 text-slate-300 font-semibold">{lead?.company ?? '-'}</td>
                      <td className="px-6 py-4 text-slate-400 text-sm">{lead?.title ?? '-'}</td>
                      <td className="px-6 py-4">
                        <ScoreBadge score={Number(lead?.score ?? 0)} />
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => openEmailModal(lead)}
                          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-lg flex items-center gap-2 transition-all whitespace-nowrap"
                        >
                          <Sparkles size={16} />
                          Generate Email
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 bg-slate-800 text-slate-400 text-sm">
            Showing {Math.min(10, leads.length)} of {total} leads • Click &quot;Generate Email&quot; to see AI in action
          </div>
        </div>
      )}

      {selectedLead && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-2xl border border-slate-700 max-w-3xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                  <Sparkles className="text-white" size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">AI Email Generator</h2>
                  <p className="text-slate-400 text-sm">
                    For {selectedLead?.firstName} {selectedLead?.lastName} • {selectedLead?.company}
                  </p>
                </div>
              </div>

              <button
                onClick={closeModal}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                aria-label="Close"
              >
                <X className="text-slate-400" size={24} />
              </button>
            </div>

            <div className="p-6">
              <div className="flex gap-2 mb-4 flex-wrap">
                {['cold', 'followup', 'meeting'].map((type) => (
                  <button
                    key={type}
                    onClick={() => {
                      setEmailType(type);
                      generateEmail(selectedLead, type);
                    }}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      emailType === type
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    {type === 'cold' && '🧊 Cold Outreach'}
                    {type === 'followup' && '📧 Follow-up'}
                    {type === 'meeting' && '📅 Meeting Request'}
                  </button>
                ))}
              </div>

              <div className="bg-slate-800 rounded-xl p-6 min-h-[400px] max-h-[500px] overflow-y-auto">
                {generatingEmail ? (
                  <div className="flex flex-col items-center justify-center h-full gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                    <p className="text-slate-400 animate-pulse">AI is crafting your perfect email...</p>
                  </div>
                ) : generatedEmail ? (
                  <div className="space-y-4">
                    <pre className="text-slate-300 whitespace-pre-wrap font-sans text-sm leading-relaxed">
                      {generatedEmail}
                    </pre>
                    <button
                      onClick={copyEmail}
                      className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg flex items-center justify-center gap-2 transition-colors"
                    >
                      {copied ? (
                        <>
                          <Check size={20} />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy size={20} />
                          Copy Email
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="text-slate-400 text-sm">
                    Select an email type to generate a message.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
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