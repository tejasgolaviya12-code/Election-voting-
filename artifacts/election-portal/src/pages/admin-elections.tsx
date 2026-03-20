import { useState } from "react";
import { useGetElections, useCreateElection, useUpdateElection, useDeleteElection } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Plus, Edit2, Trash2, X } from "lucide-react";
import { getStatusColor } from "@/lib/utils";

export default function AdminElections() {
  const { data: elections, refetch } = useGetElections();
  const { toast } = useToast();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: '', description: '', electionType: 'general', status: 'upcoming', 
    startDate: '', endDate: '', state: '', constituency: ''
  });

  const createMutation = useCreateElection({ onSuccess: () => { refetch(); setIsModalOpen(false); toast({title:"Success"}); }});
  const updateMutation = useUpdateElection({ onSuccess: () => { refetch(); setIsModalOpen(false); toast({title:"Updated"}); }});
  const deleteMutation = useDeleteElection({ onSuccess: () => { refetch(); toast({title:"Deleted"}); }});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData as any });
    } else {
      createMutation.mutate({ data: formData as any });
    }
  };

  const handleEdit = (election: any) => {
    setFormData({
      title: election.title, description: election.description || '', electionType: election.electionType,
      status: election.status, startDate: election.startDate, endDate: election.endDate,
      state: election.state, constituency: election.constituency || ''
    });
    setEditingId(election.id);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Manage Elections</h2>
        <button 
          onClick={() => { setEditingId(null); setFormData({title: '', description: '', electionType: 'general', status: 'upcoming', startDate: '', endDate: '', state: '', constituency: ''}); setIsModalOpen(true); }}
          className="bg-slate-900 text-white px-4 py-2 rounded-lg font-medium flex items-center hover:bg-slate-800"
        >
          <Plus className="w-4 h-4 mr-2" /> Create Election
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 text-sm">
            <tr>
              <th className="px-6 py-4">Title</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Dates</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {elections?.map(election => (
              <tr key={election.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-medium text-slate-900">{election.title}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase ${getStatusColor(election.status)}`}>
                    {election.status}
                  </span>
                </td>
                <td className="px-6 py-4 capitalize">{election.electionType}</td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {format(new Date(election.startDate), 'dd MMM yyyy')} - {format(new Date(election.endDate), 'dd MMM yyyy')}
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button onClick={() => handleEdit(election)} className="p-2 text-slate-400 hover:text-blue-600 bg-slate-100 hover:bg-blue-50 rounded-lg transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => confirm("Delete this election?") && deleteMutation.mutate({ id: election.id })} 
                    className="p-2 text-slate-400 hover:text-red-600 bg-slate-100 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h3 className="text-xl font-bold">{editingId ? 'Edit Election' : 'Create Election'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                  <input required className="w-full border border-slate-300 rounded-lg px-3 py-2" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                  <textarea className="w-full border border-slate-300 rounded-lg px-3 py-2" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                  <select className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white" value={formData.electionType} onChange={e => setFormData({...formData, electionType: e.target.value})}>
                    <option value="general">General</option>
                    <option value="state">State</option>
                    <option value="local">Local</option>
                    <option value="bypolls">Bypolls</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                  <select className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                    <option value="upcoming">Upcoming</option>
                    <option value="live">Live</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
                  <input required type="date" className="w-full border border-slate-300 rounded-lg px-3 py-2" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
                  <input required type="date" className="w-full border border-slate-300 rounded-lg px-3 py-2" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">State</label>
                  <input required className="w-full border border-slate-300 rounded-lg px-3 py-2" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Constituency</label>
                  <input className="w-full border border-slate-300 rounded-lg px-3 py-2" value={formData.constituency} onChange={e => setFormData({...formData, constituency: e.target.value})} />
                </div>
              </div>
              <div className="pt-4 flex justify-end space-x-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="px-6 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary/90">
                  {editingId ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
