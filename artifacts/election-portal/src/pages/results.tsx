import { useGetElections, useGetElectionResults } from "@workspace/api-client-react";
import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { PieChart, Pie, Cell as PieCell, Legend } from "recharts";
import { Trophy, Users, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";

export default function Results() {
  const { data: elections, isLoading: loadingElections } = useGetElections();
  
  // Filter for elections that have results meaning (live or completed)
  const availableElections = elections?.filter(e => e.status === 'completed' || e.status === 'live') || [];
  
  const [selectedElectionId, setSelectedElectionId] = useState<number | null>(null);

  // Auto-select first available if not selected
  if (!selectedElectionId && availableElections.length > 0) {
    setSelectedElectionId(availableElections[0].id);
  }

  const { data: results, isLoading: loadingResults } = useGetElectionResults(selectedElectionId || 0, {
    query: { enabled: !!selectedElectionId }
  });

  const selectedElection = availableElections.find(e => e.id === selectedElectionId);

  // Generate colors for chart
  const COLORS = ['#f97316', '#22c55e', '#3b82f6', '#a855f7', '#ec4899', '#f43f5e', '#eab308'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
      <div className="mb-10 text-center max-w-2xl mx-auto">
        <h1 className="text-4xl font-display font-bold text-slate-900 mb-4">Election Results</h1>
        <p className="text-lg text-slate-500">Transparent real-time and historical voting outcomes.</p>
      </div>

      {loadingElections ? (
        <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>
      ) : availableElections.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 rounded-2xl border border-slate-200">
          <BarChart3 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-600">No results available yet.</h3>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar selector */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden sticky top-24">
              <div className="p-4 bg-slate-50 border-b border-slate-200 font-semibold text-slate-700">
                Select Election
              </div>
              <div className="max-h-[60vh] overflow-y-auto p-2 space-y-1">
                {availableElections.map(election => (
                  <button
                    key={election.id}
                    onClick={() => setSelectedElectionId(election.id)}
                    className={`w-full text-left p-4 rounded-xl transition-all ${
                      selectedElectionId === election.id 
                        ? 'bg-primary/10 border border-primary/20 text-primary font-bold' 
                        : 'hover:bg-slate-50 border border-transparent text-slate-600'
                    }`}
                  >
                    <div className="line-clamp-2">{election.title}</div>
                    <div className="text-xs mt-1 font-normal opacity-70 flex justify-between">
                      <span className="uppercase tracking-wider">{election.status}</span>
                      <span>{election.state}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results Display */}
          <div className="lg:w-2/3">
            {loadingResults ? (
              <div className="h-[500px] flex items-center justify-center bg-white rounded-2xl shadow-sm border border-slate-200">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
              </div>
            ) : !results || results.length === 0 ? (
              <div className="h-[500px] flex flex-col items-center justify-center bg-white rounded-2xl shadow-sm border border-slate-200 text-slate-500">
                <Users className="w-12 h-12 mb-4 text-slate-300" />
                <p>No votes cast yet for this election.</p>
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                key={selectedElectionId} 
                className="space-y-6"
              >
                {/* Winner Callout if completed */}
                {selectedElection?.status === 'completed' && results[0] && (
                  <div className="bg-gradient-to-r from-orange-500 to-yellow-500 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
                    <div className="absolute right-0 top-0 opacity-20 transform translate-x-1/4 -translate-y-1/4">
                      <Trophy className="w-64 h-64" />
                    </div>
                    <div className="relative z-10">
                      <div className="text-white/80 font-semibold mb-1 tracking-wider uppercase text-sm">Winner</div>
                      <h2 className="text-4xl font-bold mb-2">{results[0].candidateName}</h2>
                      <div className="text-xl font-medium mb-6">{results[0].partyName}</div>
                      <div className="inline-flex items-center px-4 py-2 bg-black/20 rounded-lg backdrop-blur-md border border-white/20">
                        <span className="text-2xl font-bold mr-2">{results[0].voteCount.toLocaleString()}</span>
                        <span className="text-sm">Votes</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Main Chart */}
                <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
                  <h3 className="text-xl font-bold text-slate-800 mb-6">Vote Distribution</h3>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={results} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis 
                          dataKey="candidateName" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: '#64748b', fontSize: 12 }} 
                          angle={-45} 
                          textAnchor="end" 
                        />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                        <Tooltip 
                          cursor={{ fill: '#f1f5f9' }}
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}
                        />
                        <Bar dataKey="voteCount" radius={[6, 6, 0, 0]}>
                          {results.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Data Table */}
                <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                  <div className="p-6 border-b border-slate-200">
                    <h3 className="text-xl font-bold text-slate-800">Detailed Tally</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 text-slate-500 text-sm">
                        <tr>
                          <th className="px-6 py-4 font-semibold">Candidate</th>
                          <th className="px-6 py-4 font-semibold">Party</th>
                          <th className="px-6 py-4 font-semibold text-right">Votes</th>
                          <th className="px-6 py-4 font-semibold text-right">%</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {results.map((result, idx) => {
                          const totalVotes = results.reduce((sum, r) => sum + r.voteCount, 0);
                          const percentage = totalVotes > 0 ? ((result.voteCount / totalVotes) * 100).toFixed(1) : '0.0';
                          return (
                            <tr key={idx} className="hover:bg-slate-50 transition-colors">
                              <td className="px-6 py-4 font-semibold text-slate-900">{result.candidateName}</td>
                              <td className="px-6 py-4 text-slate-600">{result.partyName}</td>
                              <td className="px-6 py-4 text-right font-mono font-medium text-slate-900">{result.voteCount.toLocaleString()}</td>
                              <td className="px-6 py-4 text-right text-slate-500">{percentage}%</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

              </motion.div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
