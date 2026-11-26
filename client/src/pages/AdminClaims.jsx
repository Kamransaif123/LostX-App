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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E4E6EF]">
        <div>
          <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-brand-50 text-brand-700 border border-brand-200 mb-2">
            <ShieldCheck className="w-3.5 h-3.5 mr-1.5 text-brand-600" />
            Verification queue
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Review claims queue</h1>
          <p className="text-xs text-gray-500 mt-1">
            Compare claimant verification proof against finder secret details side-by-side.
          </p>
        </div>

        <Link
          to="/admin"
          className="text-xs font-medium text-gray-500 hover:text-gray-900 self-start sm:self-auto transition-colors"
        >
          ← Back to dashboard
        </Link>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#E4E6EF] pb-3">
        <button
          onClick={() => setFilterStatus('pending')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
            filterStatus === 'pending'
              ? 'bg-amber-500 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          Pending review ({filterStatus === 'pending' ? claims.length : '...'})
        </button>
        <button
          onClick={() => setFilterStatus('approved')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
            filterStatus === 'approved'
              ? 'bg-emerald-500 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          Approved
        </button>
        <button
          onClick={() => setFilterStatus('rejected')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
            filterStatus === 'rejected'
              ? 'bg-rose-500 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          Rejected
        </button>
        <button
          onClick={() => setFilterStatus('')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
            filterStatus === ''
              ? 'bg-brand-600 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          All claims
        </button>
      </div>

      {/* Claims List with Side-By-Side Comparison */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="card p-6 rounded-xl animate-pulse h-48 bg-gray-100"></div>
          ))}
        </div>
      ) : claims.length > 0 ? (
        <div className="space-y-6">
          {claims.map((claim) => {
            const foundItem = claim.foundItem;
            return (
              <div
                key={claim._id}
                className="card p-6 space-y-5"
              >
                {/* Found Item Info Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E4E6EF] pb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xs font-medium text-brand-600">
                        {foundItem?.category}
                      </span>
                      <ClaimBadge status={claim.status} />
                    </div>
                    <h2 className="text-lg font-bold text-gray-900">
                      {foundItem ? foundItem.title : 'Deleted item'}
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Location: <strong className="text-gray-900">{foundItem?.location}</strong> • Finder:{' '}
                      <strong className="text-gray-900">{foundItem?.reportedBy?.name || 'Unknown'}</strong> (
                      {foundItem?.reportedBy?.email})
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {claim.status === 'pending' && (
                      <>
                        <button
                          onClick={() => openActionModal(claim, 'approve')}
                          className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm flex items-center transition-colors"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                          Approve claim
                        </button>
                        <button
                          onClick={() => openActionModal(claim, 'reject')}
                          className="px-4 py-2 rounded-lg border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 font-semibold text-xs flex items-center transition-colors"
                        >
                          <XCircle className="w-3.5 h-3.5 mr-1.5" />
                          Reject claim
                        </button>
                      </>
                    )}
                    {foundItem && (
                      <Link
                        to={`/items/${foundItem._id}`}
                        className="px-3 py-2 rounded-lg text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 flex items-center transition-colors"
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
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-amber-800">
                      <span className="flex items-center">
                        <Lock className="w-3.5 h-3.5 mr-1.5 text-amber-600" />
                        Finder's secret verification detail
                      </span>
                      <span className="text-[11px] text-amber-700 font-normal">(Confidential)</span>
                    </div>
                    <p className="text-xs text-amber-900 leading-relaxed bg-white p-3 rounded-lg border border-amber-200 font-mono">
                      {foundItem?.privateDetails || 'No private detail recorded by finder.'}
                    </p>
                    {foundItem?.handoverInfo && (
                      <p className="text-[11px] text-amber-800">
                        <strong>Handover spot:</strong> {foundItem.handoverInfo}
                      </p>
                    )}
                  </div>

                  {/* Right: Claimant's Submitted Proof */}
                  <div className="p-4 rounded-xl bg-brand-50 border border-brand-200 space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-brand-800">
                      <span>Claimant: {claim.claimant?.name}</span>
                      <span className="text-[11px] text-brand-600 font-normal">
                        ({claim.claimant?.email})
                      </span>
                    </div>
                    <p className="text-xs text-gray-800 leading-relaxed bg-white p-3 rounded-lg border border-brand-200">
                      "{claim.proofText}"
                    </p>
                    {claim.lostItem && (
                      <p className="text-[11px] text-brand-700">
                        <strong>Linked lost report:</strong>{' '}
                        <Link
                          to={`/items/${claim.lostItem._id}`}
                          className="underline hover:text-brand-900"
                        >
                          {claim.lostItem.title}
                        </Link>
                      </p>
                    )}
                  </div>
                </div>

                {/* Admin Note if resolved */}
                {claim.adminNote && (
                  <div className="text-xs text-gray-500 pt-1">
                    <strong className="text-gray-700">Admin note:</strong> {claim.adminNote}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card p-12 text-center max-w-md mx-auto space-y-3">
          <div className="w-12 h-12 rounded-xl bg-brand-50 border border-brand-100 text-brand-600 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-gray-900">No claims in this category</h3>
          <p className="text-xs text-gray-500">
            All verification claims for this filter status have been processed.
          </p>
        </div>
      )}

      {/* Resolution Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-reveal">
          <div className="bg-white rounded-xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-md border border-[#E4E6EF]">
            <h3 className="text-lg font-bold text-gray-900">
              {actionType === 'approve' ? 'Approve verification claim' : 'Reject claim'}
            </h3>
            <p className="text-xs text-gray-500">
              {actionType === 'approve'
                ? 'Approving will mark the item as claimed and reveal the handover location to the claimant.'
                : 'Rejecting will notify the claimant with your feedback reason.'}
            </p>

            {error && (
              <div className="p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleResolveClaim} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
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
                  className="field-input w-full"
                ></textarea>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`px-5 py-2 rounded-lg text-white font-semibold text-xs transition-colors disabled:opacity-50 ${
                    actionType === 'approve'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-rose-600 hover:bg-rose-700'
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
