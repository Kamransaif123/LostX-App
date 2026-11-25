import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { ClaimBadge } from '../components/Badge';
import HandoverPassModal from '../components/HandoverPassModal';
import {
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Printer,
  Trash2
} from 'lucide-react';

export default function MyClaims() {
  const { user } = useAuth();
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPassClaim, setSelectedPassClaim] = useState(null);

  const fetchClaims = async () => {
    try {
      const res = await api.get('/claims/mine');
      if (res.data?.success) {
        setClaims(res.data.claims);
      }
    } catch (err) {
      console.error('Fetch my claims error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  const handleWithdrawClaim = async (claimId) => {
    if (!window.confirm('Are you sure you want to withdraw this claim?')) return;
    try {
      const res = await api.delete(`/claims/${claimId}`);
      if (res.data?.success) {
        setClaims((prev) => prev.filter((c) => c._id !== claimId));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to withdraw claim.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-reveal">
      <div className="pb-4 border-b border-white/[0.08]">
        <h1 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">My verification claims</h1>
        <p className="text-xs text-slate-400 mt-1">
          Review claim progress, print approved pickup passes, or withdraw pending requests.
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="glass-card p-6 rounded-xl border border-white/[0.08] animate-pulse space-y-3">
              <div className="h-5 bg-white/[0.04] rounded w-1/4"></div>
              <div className="h-4 bg-white/[0.04] rounded w-3/4"></div>
            </div>
          ))}
        </div>
      ) : claims.length > 0 ? (
        <div className="space-y-4">
          {claims.map((claim) => {
            const foundItem = claim.foundItem;
            return (
              <div
                key={claim._id}
                className="glass-panel rounded-xl border border-white/[0.08] p-5 sm:p-6 shadow-xl space-y-4 hover:border-white/[0.15] transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-3.5">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white text-base">
                        {foundItem ? foundItem.title : 'Item removed'}
                      </h3>
                      <p className="text-xs text-slate-400">
                        Claimed on {new Date(claim.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <ClaimBadge status={claim.status} />

                    {claim.status === 'approved' && (
                      <button
                        onClick={() => setSelectedPassClaim({ ...claim, claimant: user })}
                        className="inline-flex items-center px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow-glow-emerald transition-all"
                      >
                        <Printer className="w-3.5 h-3.5 mr-1.5" />
                        Print pass
                      </button>
                    )}

                    {claim.status === 'pending' && (
                      <button
                        onClick={() => handleWithdrawClaim(claim._id)}
                        className="inline-flex items-center px-3 py-1.5 rounded-lg border border-rose-500/30 text-rose-400 hover:bg-rose-500/15 font-medium text-xs transition-colors"
                        title="Withdraw this claim"
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1" />
                        Withdraw
                      </button>
                    )}

                    {foundItem && (
                      <Link
                        to={`/items/${foundItem._id}`}
                        className="text-xs font-medium text-brand-400 hover:text-brand-300 flex items-center px-2 py-1"
                      >
                        View item <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </Link>
                    )}
                  </div>
                </div>

                {/* Handover notification if approved */}
                {claim.status === 'approved' && foundItem?.handoverInfo && (
                  <div className="p-4 rounded-xl glass-card bg-emerald-500/10 border border-emerald-500/25 text-emerald-200 flex items-start space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <span className="font-semibold text-emerald-300">Claim approved! Pick up details:</span>{' '}
                      <span className="font-medium text-white">{foundItem.handoverInfo}</span>
                      <p className="text-emerald-300/80 mt-0.5 text-[11px]">
                        Please present your student/staff ID to the desk attendant for collection.
                      </p>
                    </div>
                  </div>
                )}

                {/* Admin rejection reason */}
                {claim.status === 'rejected' && claim.adminNote && (
                  <div className="p-4 rounded-xl glass-card bg-rose-500/10 border border-rose-500/25 text-rose-200 flex items-start space-x-2.5 text-xs">
                    <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-rose-300">Admin feedback:</span> {claim.adminNote}
                    </div>
                  </div>
                )}

                {/* Proof Submitted */}
                <div className="text-xs glass-card bg-white/[0.02] p-3.5 rounded-xl border border-white/[0.06]">
                  <span className="font-medium text-slate-400 block mb-1">
                    Your submitted verification proof:
                  </span>
                  <p className="text-slate-300 leading-relaxed italic">"{claim.proofText}"</p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-panel rounded-xl border border-white/[0.08] p-12 text-center max-w-md mx-auto space-y-3 shadow-2xl">
          <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-400 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-white">No claims submitted</h3>
          <p className="text-xs text-slate-400">
            If you see an item that belongs to you in the Found listings, click "Claim this item" to submit proof.
          </p>
          <Link
            to="/browse?type=found"
            className="inline-block px-4 py-2 rounded-lg text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-500 shadow-glow-emerald transition-all"
          >
            Browse found items
          </Link>
        </div>
      )}

      {/* Handover Pass Ticket Modal */}
      {selectedPassClaim && (
        <HandoverPassModal
          claim={selectedPassClaim}
          onClose={() => setSelectedPassClaim(null)}
        />
      )}
    </div>
  );
}
