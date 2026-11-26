import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api, { getImageUrl } from '../api';
import { useAuth } from '../context/AuthContext';
import { StatusBadge, TypeBadge, ClaimBadge } from '../components/Badge';
import ItemCard from '../components/ItemCard';
import EditItemModal from '../components/EditItemModal';
import HandoverPassModal from '../components/HandoverPassModal';
import { CATEGORIES } from '../constants';
import { QRCodeSVG } from 'qrcode.react';
import {
  MapPin,
  Calendar,
  User,
  ShieldCheck,
  Tag,
  AlertCircle,
  Sparkles,
  Lock,
  CheckCircle2,
  Trash2,
  Edit,
  ArrowLeft,
  RotateCcw,
  Printer,
  QrCode
} from 'lucide-react';

export default function ItemDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  const [item, setItem] = useState(null);
  const [userClaim, setUserClaim] = useState(null);
  const [matches, setMatches] = useState([]);
  const [userLostReports, setUserLostReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [passModalOpen, setPassModalOpen] = useState(false);
  const [showQrBox, setShowQrBox] = useState(false);

  // Claim modal inputs
  const [proofText, setProofText] = useState('');
  const [selectedLostId, setSelectedLostId] = useState('');
  const [submittingClaim, setSubmittingClaim] = useState(false);
  const [claimError, setClaimError] = useState('');
  const [claimSuccess, setClaimSuccess] = useState('');

  // Renew / Action feedback
  const [actionMsg, setActionMsg] = useState('');

  const fetchItemData = async () => {
    setLoading(true);
    try {
      const [itemRes, matchesRes] = await Promise.all([
        api.get(`/items/${id}`),
        api.get(`/items/${id}/matches`)
      ]);

      if (itemRes.data?.success) {
        setItem(itemRes.data.item);
        setUserClaim(itemRes.data.userClaim);
      }
      if (matchesRes.data?.success) {
        setMatches(matchesRes.data.matches);
      }
    } catch (err) {
      console.error('Fetch item detail error:', err);
      setError('Item not found or failed to load.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItemData();
  }, [id]);

  useEffect(() => {
    if (user && item?.type === 'found') {
      api.get('/items/mine')
        .then((res) => {
          if (res.data?.items) {
            setUserLostReports(res.data.items.filter((i) => i.type === 'lost'));
          }
        })
        .catch(() => {});
    }
  }, [user, item]);

  const isOwner = user && item?.reportedBy && (
    (item.reportedBy._id && item.reportedBy._id.toString() === user.id) ||
    item.reportedBy.toString() === user.id
  );

  const handleClaimSubmit = async (e) => {
    e.preventDefault();
    setClaimError('');
    setClaimSuccess('');
    setSubmittingClaim(true);

    try {
      const res = await api.post('/claims', {
        foundItemId: item._id,
        proofText,
        lostItemId: selectedLostId || undefined
      });

      if (res.data?.success) {
        setClaimSuccess('Claim submitted successfully! The admin will review your verification.');
        setUserClaim(res.data.claim);
        setTimeout(() => {
          setClaimModalOpen(false);
        }, 1200);
      }
    } catch (err) {
      setClaimError(err.response?.data?.message || 'Failed to submit claim.');
    } finally {
      setSubmittingClaim(false);
    }
  };

  const handleWithdrawClaim = async () => {
    if (!userClaim) return;
    if (!window.confirm('Withdraw your claim on this item?')) return;

    try {
      const res = await api.delete(`/claims/${userClaim._id}`);
      if (res.data?.success) {
        setUserClaim(null);
        setActionMsg('Your claim was withdrawn.');
        setTimeout(() => setActionMsg(''), 4000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to withdraw claim.');
    }
  };

  const handleRenewItem = async () => {
    try {
      const res = await api.patch(`/items/${item._id}/renew`);
      if (res.data?.success && res.data.item) {
        setItem(res.data.item);
        setActionMsg('Listing successfully renewed for 30 days!');
        setTimeout(() => setActionMsg(''), 4000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to renew listing.');
    }
  };

  const handleMarkRecovered = async () => {
    if (!window.confirm('Mark this item as recovered? This concludes the claim.')) return;
    try {
      const res = await api.patch(`/admin/items/${item._id}/recovered`);
      if (res.data?.success) {
        setItem((prev) => ({ ...prev, status: 'recovered' }));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status.');
    }
  };

  const handleDeleteItem = async () => {
    if (!window.confirm('Are you sure you want to delete this report? This cannot be undone.')) return;
    try {
      const res = await api.delete(`/items/${item._id}`);
      if (res.data?.success) {
        navigate('/browse');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete item.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 bg-rose-50 border border-rose-200 text-rose-500 rounded-xl flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">{error || 'Item not found'}</h2>
        <Link to="/browse" className="text-sm font-medium text-brand-600 hover:text-brand-700 hover:underline inline-block">
          Return to Browse
        </Link>
      </div>
    );
  }

  const categoryLabel = CATEGORIES.find((c) => c.value === item.category)?.label || item.category;
  const formattedDate = new Date(item.date).toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-reveal">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          Back to listings
        </button>

        <button
          onClick={() => setShowQrBox(!showQrBox)}
          className="inline-flex items-center text-xs font-medium text-gray-600 hover:text-gray-900 card border border-[#E4E6EF] px-3 py-1.5 rounded-lg shadow-sm hover:border-brand-300 transition-all"
        >
          <QrCode className="w-3.5 h-3.5 mr-1.5 text-brand-600" />
          {showQrBox ? 'Hide QR tag' : 'View QR tag'}
        </button>
      </div>

      {/* Action Banner Message */}
      {actionMsg && (
        <div className="p-3.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center">
          <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-500" />
          {actionMsg}
        </div>
      )}

      {/* QR Code Popup Box */}
      {showQrBox && (
        <div className="p-5 card rounded-xl flex flex-col sm:flex-row items-center gap-5">
          <div className="p-2.5 bg-white rounded-lg shadow-md border border-[#E4E6EF]">
            <QRCodeSVG value={window.location.href} size={110} />
          </div>
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-sm font-semibold text-gray-900">Campus Physical Tag QR Code</h4>
            <p className="text-xs text-gray-500 max-w-sm">
              Scan with any mobile camera to open this report directly. Security staff can print or affix this to physical storage bins.
            </p>
          </div>
        </div>
      )}

      {/* Archived Banner with Renew action */}
      {item.status === 'archived' && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-between gap-3">
          <div className="flex items-center space-x-2 text-xs font-medium">
            <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <span>This listing expired after 30 days and is currently archived.</span>
          </div>
          {(isOwner || isAdmin) && (
            <button
              onClick={handleRenewItem}
              className="px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-medium text-xs flex items-center transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
              Renew listing
            </button>
          )}
        </div>
      )}

      {/* Approved Handover Banner */}
      {item.handoverInfo && (
        <div className="p-4 sm:p-5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start space-x-3 text-xs">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-sm text-emerald-800">Verified collection counter</h4>
              <p className="mt-0.5 font-medium text-emerald-700">
                Location: <span className="underline">{item.handoverInfo}</span>
              </p>
              <p className="text-emerald-600 text-xs mt-0.5">
                Present your student or staff ID card for physical collection.
              </p>
            </div>
          </div>

          {userClaim && userClaim.status === 'approved' && (
            <button
              onClick={() => setPassModalOpen(true)}
              className="inline-flex items-center px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs self-start sm:self-auto transition-colors"
            >
              <Printer className="w-3.5 h-3.5 mr-1.5" />
              Print recovery pass
            </button>
          )}
        </div>
      )}

      {/* Main Item Card */}
      <div className="card rounded-xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* Photo Column */}
        <div className="bg-[#EEF0F8] flex items-center justify-center min-h-[300px] md:min-h-[420px] relative border-b md:border-b-0 md:border-r border-[#E4E6EF]">
          {item.imageUrl ? (
            <img
              src={getImageUrl(item.imageUrl)}
              alt={item.title}
              className="w-full h-full object-cover max-h-[450px]"
              onError={(e) => {
                e.target.style.display = 'none';
                if (e.target.nextSibling) {
                  e.target.nextSibling.style.display = 'flex';
                }
              }}
            />
          ) : null}
          <div
            className={`flex-col items-center justify-center text-gray-400 p-8 text-center ${
              item.imageUrl ? 'hidden' : 'flex'
            }`}
          >
            <Tag className="w-16 h-16 mb-2 opacity-30 text-gray-400" />
            <p className="text-sm font-semibold text-gray-500">{categoryLabel}</p>
            <p className="text-xs text-gray-400 mt-1">No photo provided for this report</p>
          </div>

          <div className="absolute top-4 left-4">
            <TypeBadge type={item.type} />
          </div>
        </div>

        {/* Details Column */}
        <div className="p-6 sm:p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-gray-500">
                {categoryLabel}
              </span>
              <StatusBadge status={item.status} />
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight leading-snug">
              {item.title}
            </h1>

            <div className="space-y-2 py-3 border-y border-[#E4E6EF] text-xs text-gray-600">
              <div className="flex items-center">
                <MapPin className="w-3.5 h-3.5 mr-2 text-brand-600 flex-shrink-0" />
                <span>
                  Location: <strong className="text-gray-900">{item.location}</strong>
                </span>
              </div>
              <div className="flex items-center">
                <Calendar className="w-3.5 h-3.5 mr-2 text-brand-600 flex-shrink-0" />
                <span>
                  Date {item.type === 'lost' ? 'lost' : 'found'}:{' '}
                  <strong className="text-gray-900">{formattedDate}</strong>
                </span>
              </div>
              <div className="flex items-center">
                <User className="w-3.5 h-3.5 mr-2 text-brand-600 flex-shrink-0" />
                <span>
                  Reported by:{' '}
                  <strong className="text-gray-900">
                    {item.reportedBy?.name || 'Campus member'}
                  </strong>
                </span>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-medium text-gray-500 mb-1">Description</h3>
              <p className="text-xs sm:text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                {item.description}
              </p>
            </div>

            {/* Hidden detail box */}
            {item.privateDetails && (
              <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 space-y-1">
                <div className="flex items-center text-xs font-medium text-amber-700">
                  <Lock className="w-3.5 h-3.5 mr-1 text-amber-500" />
                  Protected verification detail (staff / reporter view)
                </div>
                <p className="text-xs text-amber-800 font-mono">{item.privateDetails}</p>
              </div>
            )}
          </div>

          {/* Action Row */}
          <div className="pt-4 border-t border-[#E4E6EF] flex flex-wrap items-center gap-3">
            {/* Found Item Claim Action */}
            {item.type === 'found' && !isOwner && item.status !== 'recovered' && item.status !== 'claimed' && (
              <>
                {userClaim ? (
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-medium text-gray-500">Your claim:</span>
                    <ClaimBadge status={userClaim.status} />
                    {userClaim.status === 'pending' && (
                      <button
                        onClick={handleWithdrawClaim}
                        className="text-xs text-rose-500 hover:text-rose-700 hover:underline font-medium ml-2"
                        title="Withdraw pending claim"
                      >
                        (Withdraw)
                      </button>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      if (!user) {
                        navigate('/login', { state: { from: { pathname: `/items/${item._id}` } } });
                      } else {
                        setClaimModalOpen(true);
                      }
                    }}
                    className="flex-1 py-2.5 px-5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm transition-colors text-center flex items-center justify-center"
                  >
                    <ShieldCheck className="w-4 h-4 mr-2" />
                    Claim this item
                  </button>
                )}
              </>
            )}

            {/* Owner/Admin: Edit Report */}
            {(isOwner || isAdmin) && (
              <button
                onClick={() => setEditModalOpen(true)}
                className="py-2 px-3.5 rounded-lg border border-[#E4E6EF] bg-white text-gray-600 hover:text-gray-900 hover:border-gray-300 font-medium text-xs flex items-center transition-all"
              >
                <Edit className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                Edit report
              </button>
            )}

            {/* Admin: Mark as Recovered */}
            {isAdmin && item.status !== 'recovered' && (
              <button
                onClick={handleMarkRecovered}
                className="py-2 px-3.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-medium text-xs transition-colors flex items-center"
              >
                <CheckCircle2 className="w-4 h-4 mr-1.5" />
                Mark recovered
              </button>
            )}

            {/* Owner/Admin Delete */}
            {(isOwner || isAdmin) && (
              <button
                onClick={handleDeleteItem}
                className="p-2 rounded-lg border border-rose-200 bg-rose-50 text-rose-500 hover:bg-rose-100 transition-colors"
                title="Delete this report"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Suggested Matches Section */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-lg bg-brand-50 text-brand-600 border border-brand-100">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Possible match suggestions</h2>
            <p className="text-xs text-gray-500">
              Rule-based matches calculated from category, campus location, date window, and keywords.
            </p>
          </div>
        </div>

        {matches.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {matches.map((m) => (
              <ItemCard key={m._id} item={m.targetItem} matchScore={m.score} />
            ))}
          </div>
        ) : (
          <div className="card rounded-xl p-8 text-center text-gray-500 text-xs">
            No strong matches found yet for this report. As new items are reported, the engine will automatically notify you.
          </div>
        )}
      </div>

      {/* Claim Submission Modal */}
      {claimModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-reveal">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-md border border-[#E4E6EF]">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Claim verification</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Claiming: <strong className="text-gray-900">{item.title}</strong>
                </p>
              </div>
              <button
                onClick={() => setClaimModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 text-lg font-semibold transition-colors"
              >
                ✕
              </button>
            </div>

            {claimError && (
              <div className="p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg">
                {claimError}
              </div>
            )}

            {claimSuccess && (
              <div className="p-3 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                {claimSuccess}
              </div>
            )}

            <form onSubmit={handleClaimSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Describe private / hidden proof details <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe details only the real owner would know: wallpaper, ID digits, keychain style, contents inside zipper pocket, specific scratch or stickers..."
                  value={proofText}
                  onChange={(e) => setProofText(e.target.value)}
                  className="field-input w-full"
                ></textarea>
                <p className="text-[11px] text-gray-400 mt-1">
                  This description is sent privately to the campus administrator to compare with the finder's stored detail.
                </p>
              </div>

              {userLostReports.length > 0 && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Link one of your existing lost reports (optional)
                  </label>
                  <select
                    value={selectedLostId}
                    onChange={(e) => setSelectedLostId(e.target.value)}
                    className="field-input w-full"
                  >
                    <option value="">None (Claim independently)</option>
                    {userLostReports.map((lr) => (
                      <option key={lr._id} value={lr._id}>
                        {lr.title} ({lr.location})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setClaimModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingClaim || !proofText.trim()}
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors disabled:opacity-50"
                >
                  {submittingClaim ? 'Submitting...' : 'Submit claim'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Item Modal */}
      {editModalOpen && (
        <EditItemModal
          item={item}
          onClose={() => setEditModalOpen(false)}
          onItemUpdated={(updated) => {
            setItem(updated);
            setActionMsg('Report updated successfully.');
            setTimeout(() => setActionMsg(''), 4000);
          }}
        />
      )}

      {/* Handover Pass Ticket Modal */}
      {passModalOpen && (
        <HandoverPassModal
          claim={{ ...userClaim, foundItem: item, claimant: user }}
          onClose={() => setPassModalOpen(false)}
        />
      )}
    </div>
  );
}
