import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { ClaimBadge } from '../components/Badge';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Eye,
  Lock,
  ArrowRight,
  MapPin,
  Calendar,
  AlertCircle
} from 'lucide-react';

export default function AdminClaims() {
  const [claims, setClaims] = useState([]);
  const [filterStatus, setFilterStatus] = useState('pending');
  const [loading, setLoading] = useState(true);

  // Review modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [actionType, setActionType] = useState('approve'); // 'approve' | 'reject'
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 mb-2">
            <ShieldCheck className="w-3.5 h-3.5 mr-1" />
            Verification Queue
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Review Claims Queue</h1>
          <p className="text-xs text-slate-500 mt-1">
            Compare claimant verification proof against finder secret details side-by-side.
          </p>
        </div>

        <Link
          to="/admin"
          className="text-xs font-bold text-slate-600 hover:text-slate-900 self-start sm:self-auto"
        >
          ← Back to Dashboard
        </Link>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setFilterStatus('pending')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            filterStatus === 'pending'
              ? 'bg-amber-500 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Pending Review ({filterStatus === 'pending' ? claims.length : '...'})
        </button>
        <button
          onClick={() => setFilterStatus('approved')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            filterStatus === 'approved'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Approved
        </button>
        <button
          onClick={() => setFilterStatus('rejected')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            filterStatus === 'rejected'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Rejected
        </button>
        <button
          onClick={() => setFilterStatus('')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            filterStatus === ''
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          All Claims
        </button>
      </div>

      {/* Claims List with Side-By-Side Comparison */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white p-6 rounded-3xl border border-slate-200 animate-pulse h-48"></div>
          ))}
        </div>
      ) : claims.length > 0 ? (
        <div className="space-y-6">
          {claims.map((claim) => {
            const foundItem = claim.foundItem;
            return (
              <div
                key={claim._id}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 space-y-5"
              >
                {/* Found Item Info Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-teal-600">
                        {foundItem?.category}
                      </span>
                      <ClaimBadge status={claim.status} />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900">
                      {foundItem ? foundItem.title : 'Deleted Item'}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Location: <strong className="text-slate-700">{foundItem?.location}</strong> • Finder:{' '}
                      <strong className="text-slate-700">{foundItem?.reportedBy?.name || 'Unknown'}</strong> (
                      {foundItem?.reportedBy?.email})
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {claim.status === 'pending' && (
                      <>
                        <button
                          onClick={() => openActionModal(claim, 'approve')}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm shadow-emerald-200 flex items-center transition-all"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                          Approve Claim
                        </button>
                        <button
                          onClick={() => openActionModal(claim, 'reject')}
                          className="px-4 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-xs flex items-center transition-all"
                        >
                          <XCircle className="w-3.5 h-3.5 mr-1.5" />
                          Reject Claim
                        </button>
                      </>
                    )}
                    {foundItem && (
                      <Link
                        to={`/items/${foundItem._id}`}
                        className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 flex items-center"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" />
                        View
                      </Link>
                    )}
                  </div>
                </div>

                {/* SIDE-BY-SIDE VERIFICATION COMPARISON */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left: Finder's Stored Private Detail */}
                  <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-amber-900 uppercase tracking-wider">
                      <span className="flex items-center">
                        <Lock className="w-3.5 h-3.5 mr-1 text-amber-700" />
                        Finder's Secret Verification Detail
                      </span>
                      <span className="text-[10px] text-amber-700 font-semibold">(Confidential)</span>
                    </div>
                    <p className="text-xs text-amber-950 font-medium leading-relaxed bg-white/70 p-3 rounded-xl border border-amber-200/50">
                      {foundItem?.privateDetails || 'No private detail recorded by finder.'}
                    </p>
                    {foundItem?.handoverInfo && (
                      <p className="text-[11px] text-amber-800">
                        <strong>Handover Spot:</strong> {foundItem.handoverInfo}
                      </p>
                    )}
                  </div>

                  {/* Right: Claimant's Submitted Proof */}
                  <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-indigo-900 uppercase tracking-wider">
                      <span>Claimant: {claim.claimant?.name}</span>
                      <span className="text-[10px] text-indigo-700 font-normal">
                        ({claim.claimant?.email})
                      </span>
                    </div>
                    <p className="text-xs text-indigo-950 font-medium leading-relaxed bg-white/70 p-3 rounded-xl border border-indigo-200/50">
                      "{claim.proofText}"
                    </p>
                    {claim.lostItem && (
                      <p className="text-[11px] text-indigo-700">
                        <strong>Linked Lost Report:</strong>{' '}
                        <Link
                          to={`/items/${claim.lostItem._id}`}
                          className="underline hover:text-indigo-900"
                        >
                          {claim.lostItem.title}
                        </Link>
                      </p>
                    )}
                  </div>
                </div>

                {/* Admin Note if resolved */}
                {claim.adminNote && (
                  <div className="text-xs text-slate-500 pt-1">
                    <strong>Admin Note:</strong> {claim.adminNote}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No claims in this category</h3>
          <p className="text-xs text-slate-500">
            All verification claims for this filter status have been processed.
          </p>
        </div>
      )}

      {/* Resolution Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-100">
            <h3 className="text-xl font-black text-slate-900">
              {actionType === 'approve' ? 'Approve Verification Claim' : 'Reject Claim'}
            </h3>
            <p className="text-xs text-slate-500">
              {actionType === 'approve'
                ? 'Approving will mark the item as claimed and reveal the handover location to the claimant.'
                : 'Rejecting will notify the claimant with your feedback reason.'}
            </p>

            {error && (
              <div className="p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
                {error}
              </div>
            )}

            <form onSubmit={handleResolveClaim} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  {actionType === 'approve' ? 'Optional Admin Note' : 'Rejection Reason'}
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
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                ></textarea>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`px-5 py-2.5 rounded-xl text-white font-bold text-xs shadow-md transition-all disabled:opacity-50 ${
                    actionType === 'approve'
                      ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'
                      : 'bg-rose-600 hover:bg-rose-700 shadow-rose-200'
                  }`}
                >
                  {submitting
                    ? 'Processing...'
                    : actionType === 'approve'
                    ? 'Confirm Approval'
                    : 'Confirm Rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
