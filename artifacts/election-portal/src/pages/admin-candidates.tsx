import { useState } from "react";
import { useGetCandidates, useGetElections, useCreateCandidate, useUpdateCandidate, useDeleteCandidate } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit2, Trash2, X } from "lucide-react";

export default function AdminCandidates() {
  const { data: candidates, refetch } = useGetCandidates();
  const { data: elections } = useGetElections();
  const { toast } = useToast();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  // Default values
  const [formData, setFormData] = useState({
    electionId: '', name: '', partyName: '', partySymbol: '', constituency: '', state: '', age: '', education: '', bio: '', imageUrl: ''
  });

  const createMutation = useCreateCandidate({ onSuccess: () => { refetch(); setIsModalOpen(false); toast({title:"Success"}); }});
  const updateMutation = useUpdateCandidate({ onSuccess: () => { refetch(); setIsModalOpen(false); toast({title:"Updated"}); }});
  const deleteMutation = useDeleteCandidate({ onSuccess: () => { refetch(); toast({title:"Deleted"}); }});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...formData, electionId: parseInt(formData.electionId, 10), age: parseInt(formData.age, 10) || undefined };
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: payload as any });
    } else {
      createMutation.mutate({ data: payload as any });
    }
  };

  const handleEdit = (candidate: any) => {
    setFormData({
      electionId: candidate.electionId.toString(), name: candidate.name, partyName: candidate.partyName, 
      partySymbol: candidate.partySymbol || '', constituency: candidate.constituency || '', state: candidate.state, 
      age: candidate.age?.toString() || '', education: candidate.education || '', bio: candidate.bio || '', imageUrl: candidate.imageUrl || ''
    });
    setEditingId(candidate.id);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Manage Candidates</h2>
        <button 
          onClick={() => { setEditingId(null); setFormData({electionId: '', name: '', partyName: '', partySymbol: '', constituency: '', state: '', age: '', education: '', bio: '', imageUrl: ''}); setIsModalOpen(true); }}
          className="bg-slate-900 text-white px-4 py-2 rounded-lg font-medium flex items-center hover:bg-slate-800"
        >
          <Plus className="w-4 h-4 mr-2" /> Add Candidate
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 text-sm">
            <tr>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Party</th>
              <th className="px-6 py-4">Election</th>
              <th className="px-6 py-4">State</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {candidates?.map(candidate => (
              <tr key={candidate.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-medium text-slate-900 flex items-center">
                  {candidate.imageUrl && <img src={candidate.imageUrl} className="w-8 h-8 rounded-full object-cover mr-3" alt="" />}
                  {candidate.name}
                </td>
                <td className="px-6 py-4">
                  {candidate.partyName} {candidate.partySymbol && <span className="text-xs border px-1 rounded ml-1">{candidate.partySymbol}</span>}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {elections?.find(e => e.id === candidate.electionId)?.title || `ID: ${candidate.electionId}`}
                </td>
                <td className="px-6 py-4 text-sm">{candidate.state}</td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button onClick={() => handleEdit(candidate)} className="p-2 text-slate-400 hover:text-blue-600 bg-slate-100 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => confirm("Delete this candidate?") && deleteMutation.mutate({ id: candidate.id })} className="p-2 text-slate-400 hover:text-red-600 bg-slate-100 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
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
              <h3 className="text-xl font-bold">{editingId ? 'Edit Candidate' : 'Add Candidate'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Election</label>
                  <select required className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white" value={formData.electionId} onChange={e => setFormData({...formData, electionId: e.target.value})}>
                    <option value="">Select Election...</option>
                    {elections?.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
                  </select>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                  <input required className="w-full border border-slate-300 rounded-lg px-3 py-2" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1">State</label>
                  <input required className="w-full border border-slate-300 rounded-lg px-3 py-2" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Party Name</label>
                  <input required className="w-full border border-slate-300 rounded-lg px-3 py-2" value={formData.partyName} onChange={e => setFormData({...formData, partyName: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Party Symbol (emoji/text)</label>
                  <input className="w-full border border-slate-300 rounded-lg px-3 py-2" value={formData.partySymbol} onChange={e => setFormData({...formData, partySymbol: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Constituency</label>
                  <input className="w-full border border-slate-300 rounded-lg px-3 py-2" value={formData.constituency} onChange={e => setFormData({...formData, constituency: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Age</label>
                  <input type="number" className="w-full border border-slate-300 rounded-lg px-3 py-2" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Education</label>
                  <input className="w-full border border-slate-300 rounded-lg px-3 py-2" value={formData.education} onChange={e => setFormData({...formData, education: e.target.value})} />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Photo URL</label>
                  <input type="url" placeholder="https://..." className="w-full border border-slate-300 rounded-lg px-3 py-2" value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Bio</label>
                  <textarea rows={3} className="w-full border border-slate-300 rounded-lg px-3 py-2" value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} />
                </div>
              </div>
              <div className="pt-4 flex justify-end space-x-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="px-6 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary/90">
                  {editingId ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
