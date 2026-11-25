import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { ClaimBadge } from '../components/Badge';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Eye,
  Lock
} from 'lucide-react';

export default function AdminClaims() {
  const [claims, setClaims] = useState([]);
  const [filterStatus, setFilterStatus] = useState('pending');
  const [loading, setLoading] = useState(true);

  // Review modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [actionType, setActionType] = useState('approve');
  const [adminNote, setAdminNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchClaims = async () => {
    setLoading(true);
    try {
      const url = filterStatus ? `/claims?status=${filterStatus}` : '/claims';
      const res = await api.get(url);
      if (res.data?.success) {
        setClaims(res.data.claims);
      }
    } catch (err) {
      console.error('Fetch admin claims error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, [filterStatus]);

  const openActionModal = (claim, type) => {
    setSelectedClaim(claim);
    setActionType(type);
    setAdminNote(type === 'approve' ? 'Verification matched successfully. Handover approved.' : '');
    setError('');
    setModalOpen(true);
  };

  const handleResolveClaim = async (e) => {
    e.preventDefault();
    if (!selectedClaim) return;

    setSubmitting(true);
    setError('');

    try {
      const res = await api.patch(`/claims/${selectedClaim._id}`, {
        status: actionType === 'approve' ? 'approved' : 'rejected',
        adminNote: adminNote.trim()
      });

      if (res.data?.success) {
        setModalOpen(false);
        fetchClaims();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update claim.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-reveal">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div>
          <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-brand-500/15 text-brand-300 border border-brand-500/30 mb-2">
            <ShieldCheck className="w-3.5 h-3.5 mr-1.5 text-brand-400" />
            Verification queue
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">Review claims queue</h1>
          <p className="text-xs text-slate-400 mt-1">
            Compare claimant verification proof against finder secret details side-by-side.
          </p>
        </div>

        <Link
          to="/admin"
          className="text-xs font-medium text-slate-400 hover:text-white self-start sm:self-auto transition-colors"
        >
          ← Back to dashboard
        </Link>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-white/[0.08] pb-3">
        <button
          onClick={() => setFilterStatus('pending')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
            filterStatus === 'pending'
              ? 'bg-amber-500/25 text-amber-300 border border-amber-500/40'
              : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
          }`}
        >
          Pending review ({filterStatus === 'pending' ? claims.length : '...'})
        </button>
        <button
          onClick={() => setFilterStatus('approved')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
            filterStatus === 'approved'
              ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 shadow-glow-emerald'
              : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
          }`}
        >
          Approved
        </button>
        <button
          onClick={() => setFilterStatus('rejected')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
            filterStatus === 'rejected'
              ? 'bg-rose-500/25 text-rose-300 border border-rose-500/40 shadow-glow-rose'
              : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
          }`}
        >
          Rejected
        </button>
        <button
          onClick={() => setFilterStatus('')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
            filterStatus === ''
              ? 'bg-brand-600/30 text-brand-300 border border-brand-500/40 shadow-glow-sm'
              : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
          }`}
        >
          All claims
        </button>
      </div>

      {/* Claims List with Side-By-Side Comparison */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="glass-card p-6 rounded-xl border border-white/[0.08] animate-pulse h-48"></div>
          ))}
        </div>
      ) : claims.length > 0 ? (
        <div className="space-y-6">
          {claims.map((claim) => {
            const foundItem = claim.foundItem;
            return (
              <div
                key={claim._id}
                className="glass-panel rounded-xl border border-white/[0.08] shadow-xl p-6 space-y-5"
              >
                {/* Found Item Info Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.06] pb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xs font-medium text-brand-400">
                        {foundItem?.category}
                      </span>
                      <ClaimBadge status={claim.status} />
                    </div>
                    <h2 className="text-lg font-semibold text-white">
                      {foundItem ? foundItem.title : 'Deleted item'}
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Location: <strong className="text-slate-200">{foundItem?.location}</strong> • Finder:{' '}
                      <strong className="text-slate-200">{foundItem?.reportedBy?.name || 'Unknown'}</strong> (
                      {foundItem?.reportedBy?.email})
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {claim.status === 'pending' && (
                      <>
                        <button
                          onClick={() => openActionModal(claim, 'approve')}
                          className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow-glow-emerald flex items-center transition-all"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                          Approve claim
                        </button>
                        <button
                          onClick={() => openActionModal(claim, 'reject')}
                          className="px-4 py-2 rounded-lg border border-rose-500/30 text-rose-400 hover:bg-rose-500/15 font-medium text-xs flex items-center transition-all"
                        >
                          <XCircle className="w-3.5 h-3.5 mr-1.5" />
                          Reject claim
                        </button>
                      </>
                    )}
                    {foundItem && (
                      <Link
                        to={`/items/${foundItem._id}`}
                        className="px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-white/[0.08] flex items-center transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1.5" />
                        View
                      </Link>
                    )}
                  </div>
                </div>

                {/* SIDE-BY-SIDE VERIFICATION COMPARISON */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left: Finder's Stored Private Detail */}
                  <div className="p-4 rounded-xl glass-card bg-amber-500/10 border border-amber-500/25 space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-amber-300">
                      <span className="flex items-center">
                        <Lock className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
                        Finder's secret verification detail
                      </span>
                      <span className="text-[11px] text-amber-400/80 font-normal">(Confidential)</span>
                    </div>
                    <p className="text-xs text-amber-100 leading-relaxed bg-black/30 p-3 rounded-lg border border-amber-500/20 font-mono">
                      {foundItem?.privateDetails || 'No private detail recorded by finder.'}
                    </p>
                    {foundItem?.handoverInfo && (
                      <p className="text-[11px] text-amber-300/90">
                        <strong>Handover spot:</strong> {foundItem.handoverInfo}
                      </p>
                    )}
                  </div>

                  {/* Right: Claimant's Submitted Proof */}
                  <div className="p-4 rounded-xl glass-card bg-brand-500/10 border border-brand-500/25 space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-brand-300">
                      <span>Claimant: {claim.claimant?.name}</span>
                      <span className="text-[11px] text-brand-300/70 font-normal">
                        ({claim.claimant?.email})
                      </span>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed bg-black/30 p-3 rounded-lg border border-brand-500/20">
                      "{claim.proofText}"
                    </p>
                    {claim.lostItem && (
                      <p className="text-[11px] text-brand-300">
                        <strong>Linked lost report:</strong>{' '}
                        <Link
                          to={`/items/${claim.lostItem._id}`}
                          className="underline hover:text-white"
                        >
                          {claim.lostItem.title}
                        </Link>
                      </p>
                    )}
                  </div>
                </div>

                {/* Admin Note if resolved */}
                {claim.adminNote && (
                  <div className="text-xs text-slate-400 pt-1">
                    <strong className="text-slate-300">Admin note:</strong> {claim.adminNote}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-panel rounded-xl border border-white/[0.08] p-12 text-center max-w-md mx-auto space-y-3 shadow-2xl">
          <div className="w-12 h-12 rounded-xl bg-brand-500/15 border border-brand-500/30 text-brand-400 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-white">No claims in this category</h3>
          <p className="text-xs text-slate-400">
            All verification claims for this filter status have been processed.
          </p>
        </div>
      )}

      {/* Resolution Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-reveal">
          <div className="glass-panel rounded-xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-white/[0.12]">
            <h3 className="text-lg font-semibold text-white">
              {actionType === 'approve' ? 'Approve verification claim' : 'Reject claim'}
            </h3>
            <p className="text-xs text-slate-400">
              {actionType === 'approve'
                ? 'Approving will mark the item as claimed and reveal the handover location to the claimant.'
                : 'Rejecting will notify the claimant with your feedback reason.'}
            </p>

            {error && (
              <div className="p-3 text-xs text-rose-300 bg-rose-500/15 border border-rose-500/30 rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleResolveClaim} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  {actionType === 'approve' ? 'Optional admin note' : 'Rejection reason'}
                </label>
                <textarea
                  required={actionType === 'reject'}
                  rows={3}
                  placeholder={
                    actionType === 'approve'
                      ? 'Note visible on record...'
                      : 'Provide reason (e.g. proof details did not match the hidden wallpaper or ID)...'
                  }
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  className="glass-input w-full px-3.5 py-2.5 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
                ></textarea>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`px-5 py-2 rounded-lg text-white font-medium text-xs transition-all disabled:opacity-50 ${
                    actionType === 'approve'
                      ? 'bg-emerald-600 hover:bg-emerald-500 shadow-glow-emerald'
                      : 'bg-rose-600 hover:bg-rose-500 shadow-glow-rose'
                  }`}
                >
                  {submitting
                    ? 'Processing...'
                    : actionType === 'approve'
                    ? 'Confirm approval'
                    : 'Confirm rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
