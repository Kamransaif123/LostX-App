import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { ClaimBadge } from '../components/Badge';
import HandoverPassModal from '../components/HandoverPassModal';
import { CheckCircle2, AlertCircle, ArrowRight, ShieldCheck, Printer, Trash2 } from 'lucide-react';

export default function MyClaims() {
  const { user } = useAuth();
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPassClaim, setSelectedPassClaim] = useState(null);

  useEffect(() => {
    api.get('/claims/mine').then((res) => { if (res.data?.success) setClaims(res.data.claims); }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleWithdrawClaim = async (claimId) => {
    if (!window.confirm('Withdraw this claim?')) return;
    try {
      const res = await api.delete(`/claims/${claimId}`);
      if (res.data?.success) setClaims((prev) => prev.filter((c) => c._id !== claimId));
    } catch (err) { alert(err.response?.data?.message || 'Failed.'); }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-reveal">
      <div className="pb-4 border-b border-[#E4E6EF]">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">My verification claims</h1>
        <p className="text-xs text-gray-500 mt-0.5">Review claim progress, print approved pickup passes, or withdraw pending requests.</p>
      </div>

      {loading ? (
        <div className="space-y-4">{[1, 2].map((i) => <div key={i} className="card p-6 animate-pulse space-y-3"><div className="h-5 bg-gray-100 rounded w-1/4" /><div className="h-4 bg-gray-100 rounded w-3/4" /></div>)}</div>
      ) : claims.length > 0 ? (
        <div className="space-y-4">
          {claims.map((claim) => {
            const foundItem = claim.foundItem;
            return (
              <div key={claim._id} className="card p-5 sm:p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E4E6EF] pb-3.5">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center"><ShieldCheck className="w-5 h-5" /></div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">{foundItem ? foundItem.title : 'Item removed'}</h3>
                      <p className="text-xs text-gray-500">Claimed on {new Date(claim.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <ClaimBadge status={claim.status} />
                    {claim.status === 'approved' && <button onClick={() => setSelectedPassClaim({ ...claim, claimant: user })} className="inline-flex items-center px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs shadow-sm transition-colors"><Printer className="w-3.5 h-3.5 mr-1.5" />Print pass</button>}
                    {claim.status === 'pending' && <button onClick={() => handleWithdrawClaim(claim._id)} className="inline-flex items-center px-3 py-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs transition-colors"><Trash2 className="w-3.5 h-3.5 mr-1" />Withdraw</button>}
                    {foundItem && <Link to={`/items/${foundItem._id}`} className="text-xs font-medium text-brand-600 hover:text-brand-700 flex items-center px-2 py-1">View item <ArrowRight className="w-3.5 h-3.5 ml-1" /></Link>}
                  </div>
                </div>
                {claim.status === 'approved' && foundItem?.handoverInfo && (
                  <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-start space-x-2.5 text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <div><span className="font-semibold">Claim approved! Pick up at:</span> <span>{foundItem.handoverInfo}</span><p className="text-emerald-700 mt-0.5 text-[11px]">Present your student/staff ID for collection.</p></div>
                  </div>
                )}
                {claim.status === 'rejected' && claim.adminNote && (
                  <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 flex items-start space-x-2.5 text-xs"><AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" /><div><span className="font-semibold">Admin feedback:</span> {claim.adminNote}</div></div>
                )}
                <div className="text-xs bg-[#F7F8FC] p-3.5 rounded-lg border border-[#E4E6EF]">
                  <span className="font-medium text-gray-500 block mb-1">Your submitted proof:</span>
                  <p className="text-gray-700 italic">"{claim.proofText}"</p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card p-12 text-center max-w-md mx-auto space-y-3">
          <div className="w-12 h-12 rounded-xl bg-gray-100 text-gray-400 flex items-center justify-center mx-auto"><ShieldCheck className="w-6 h-6" /></div>
          <h3 className="text-base font-semibold text-gray-900">No claims submitted</h3>
          <p className="text-xs text-gray-500">If you see an item that belongs to you in found listings, click "Claim this item" to submit proof.</p>
          <Link to="/browse?type=found" className="inline-block px-4 py-2 rounded-lg text-xs font-medium text-white bg-brand-600 hover:bg-brand-700">Browse found items</Link>
        </div>
      )}

      {selectedPassClaim && <HandoverPassModal claim={selectedPassClaim} onClose={() => setSelectedPassClaim(null)} />}
    </div>
  );
}