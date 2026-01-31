import { useState, useEffect } from 'react';
import { uploadCSV, getImports, getImport } from '../services/api';
import { Upload, Clock, CheckCircle, XCircle } from 'lucide-react';

export default function Imports() {
  const [imports, setImports] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadImports();
    const interval = setInterval(loadImports, 2000);
    return () => clearInterval(interval);
  }, []);

  const loadImports = async () => {
    try {
      const { data } = await getImports();
      setImports(data);
    } catch (error) {
      console.error('Failed to load imports:', error);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      await uploadCSV(file);
      await loadImports();
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold text-white">CSV Imports</h1>
        
        <label className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium cursor-pointer transition-colors flex items-center gap-2">
          <Upload size={20} />
          Upload CSV
          <input
            type="file"
            accept=".csv"
            onChange={handleUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>

      {uploading && (
        <div className="bg-blue-950/30 border border-blue-500/20 rounded-xl p-4 mb-6">
          <p className="text-blue-400">Uploading and processing...</p>
        </div>
      )}

      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-800">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Filename</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Status</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Records</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Processed</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Duplicates</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {imports.map((imp) => (
              <tr key={imp._id} className="hover:bg-slate-800/50">
                <td className="px-6 py-4 text-slate-300">{imp.filename}</td>
                <td className="px-6 py-4">
                  <StatusBadge status={imp.status} />
                </td>
                <td className="px-6 py-4 text-slate-300">{imp.totalRecords}</td>
                <td className="px-6 py-4 text-slate-300">{imp.processedRecords}</td>
                <td className="px-6 py-4 text-slate-300">{imp.duplicatesFound}</td>
                <td className="px-6 py-4 text-slate-400 text-sm">
                  {new Date(imp.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const config = {
    queued: { icon: Clock, color: 'text-yellow-400 bg-yellow-400/10', text: 'Queued' },
    processing: { icon: Clock, color: 'text-blue-400 bg-blue-400/10', text: 'Processing' },
    completed: { icon: CheckCircle, color: 'text-emerald-400 bg-emerald-400/10', text: 'Completed' },
    failed: { icon: XCircle, color: 'text-red-400 bg-red-400/10', text: 'Failed' },
  };

  const { icon: Icon, color, text } = config[status] || config.queued;

  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${color}`}>
      <Icon size={16} />
      {text}
    </span>
  );
}
