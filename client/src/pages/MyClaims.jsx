import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { ClaimBadge } from '../components/Badge';
import HandoverPassModal from '../components/HandoverPassModal';
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  MapPin,
  Tag,
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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">My Verification Claims</h1>
        <p className="text-xs text-slate-500 mt-1">
          Review claim progress, print approved pickup passes, or withdraw pending requests.
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 animate-pulse space-y-3">
              <div className="h-5 bg-slate-200 rounded w-1/4"></div>
              <div className="h-4 bg-slate-200 rounded w-3/4"></div>
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
                className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-sm space-y-4 hover:border-slate-300 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">
                        {foundItem ? foundItem.title : 'Item Removed'}
                      </h3>
                      <p className="text-xs text-slate-400">
                        Claimed on {new Date(claim.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <ClaimBadge status={claim.status} />

                    {claim.status === 'approved' && (
                      <button
                        onClick={() => setSelectedPassClaim({ ...claim, claimant: user })}
                        className="inline-flex items-center px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all"
                      >
                        <Printer className="w-3.5 h-3.5 mr-1" />
                        Print Pass
                      </button>
                    )}

                    {claim.status === 'pending' && (
                      <button
                        onClick={() => handleWithdrawClaim(claim._id)}
                        className="inline-flex items-center px-3 py-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-xs transition-colors"
                        title="Withdraw this claim"
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1" />
                        Withdraw
                      </button>
                    )}

                    {foundItem && (
                      <Link
                        to={`/items/${foundItem._id}`}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center px-2 py-1"
                      >
                        View Item <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </Link>
                    )}
                  </div>
                </div>

                {/* Handover notification if approved */}
                {claim.status === 'approved' && foundItem?.handoverInfo && (
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <span className="font-bold">Claim Approved! Pick up details:</span>{' '}
                      <span className="font-semibold">{foundItem.handoverInfo}</span>
                      <p className="text-emerald-700 mt-0.5 text-[11px]">
                        Please present your student/staff ID to the desk attendant for collection.
                      </p>
                    </div>
                  </div>
                )}

                {/* Admin rejection reason */}
                {claim.status === 'rejected' && claim.adminNote && (
                  <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start space-x-2.5 text-xs">
                    <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Admin Feedback:</span> {claim.adminNote}
                    </div>
                  </div>
                )}

                {/* Proof Submitted */}
                <div className="text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <span className="font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Your Submitted Verification Proof:
                  </span>
                  <p className="text-slate-700 leading-relaxed italic">"{claim.proofText}"</p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No claims submitted</h3>
          <p className="text-xs text-slate-500">
            If you see an item that belongs to you in the Found listings, click "Claim This Item" to submit proof.
          </p>
          <Link
            to="/browse?type=found"
            className="inline-block px-4 py-2 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700"
          >
            Browse Found Items
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
