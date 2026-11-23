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
  EyeOff,
  CheckCircle2,
  Trash2,
  Edit,
  ArrowLeft,
  RotateCcw,
  Printer,
  QrCode,
  XCircle
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
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">{error || 'Item not found'}</h2>
        <Link to="/browse" className="text-sm font-bold text-indigo-600 hover:underline inline-block">
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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          Back to listings
        </button>

        <button
          onClick={() => setShowQrBox(!showQrBox)}
          className="inline-flex items-center text-xs font-bold text-slate-600 hover:text-indigo-600 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-sm transition-colors"
        >
          <QrCode className="w-3.5 h-3.5 mr-1.5" />
          {showQrBox ? 'Hide QR Code' : 'Item QR Code'}
        </button>
      </div>

      {/* Action Banner Message */}
      {actionMsg && (
        <div className="p-3.5 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center shadow-sm">
          <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-600" />
          {actionMsg}
        </div>
      )}

      {/* QR Code Popup Box */}
      {showQrBox && (
        <div className="p-5 bg-white border border-slate-200 rounded-3xl shadow-lg flex flex-col sm:flex-row items-center gap-5">
          <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-200 shadow-sm">
            <QRCodeSVG value={window.location.href} size={110} />
          </div>
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-sm font-black text-slate-900">Campus Physical Tag QR Code</h4>
            <p className="text-xs text-slate-500 max-w-sm">
              Scan with any mobile camera to open this report directly. Security staff can print or affix this to physical storage bins.
            </p>
          </div>
        </div>
      )}

      {/* Archived Banner with Renew action */}
      {item.status === 'archived' && (
        <div className="p-4 rounded-2xl bg-slate-100 border border-slate-300 text-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center space-x-2 text-xs font-semibold">
            <AlertCircle className="w-4 h-4 text-slate-500 flex-shrink-0" />
            <span>This listing expired after 30 days and is currently archived.</span>
          </div>
          {(isOwner || isAdmin) && (
            <button
              onClick={handleRenewItem}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm flex items-center"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
              Renew for 30 Days
            </button>
          )}
        </div>
      )}

      {/* Approved Handover Banner (with Print Pass Action) */}
      {item.handoverInfo && (
        <div className="p-5 rounded-3xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-start space-x-3 text-xs">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-black text-sm text-emerald-950">Verified Collection Handover Spot</h4>
              <p className="mt-0.5 font-bold text-emerald-900">
                Location: <span className="underline">{item.handoverInfo}</span>
              </p>
              <p className="text-emerald-700 text-[11px] mt-0.5">
                Bring your student/staff ID card for physical collection.
              </p>
            </div>
          </div>

          {userClaim && userClaim.status === 'approved' && (
            <button
              onClick={() => setPassModalOpen(true)}
              className="inline-flex items-center px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-200 self-start sm:self-auto"
            >
              <Printer className="w-3.5 h-3.5 mr-1.5" />
              Print Handover Pass
            </button>
          )}
        </div>
      )}

      {/* Main Item Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* Photo Column */}
        <div className="bg-slate-100 flex items-center justify-center min-h-[300px] md:min-h-[420px] relative">
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
            className={`flex-col items-center justify-center text-slate-400 p-8 text-center ${
              item.imageUrl ? 'hidden' : 'flex'
            }`}
          >
            <Tag className="w-16 h-16 mb-2 opacity-30" />
            <p className="text-sm font-semibold">{categoryLabel}</p>
            <p className="text-xs text-slate-400 mt-1">No photo provided for this report</p>
          </div>

          <div className="absolute top-4 left-4">
            <TypeBadge type={item.type} />
          </div>
        </div>

        {/* Details Column */}
        <div className="p-6 sm:p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                {categoryLabel}
              </span>
              <StatusBadge status={item.status} />
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
              {item.title}
            </h1>

            <div className="space-y-2 py-3 border-y border-slate-100 text-xs text-slate-600">
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-2 text-indigo-500 flex-shrink-0" />
                <span>
                  Campus Location: <strong className="text-slate-800">{item.location}</strong>
                </span>
              </div>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-indigo-500 flex-shrink-0" />
                <span>
                  Date {item.type === 'lost' ? 'Lost' : 'Found'}:{' '}
                  <strong className="text-slate-800">{formattedDate}</strong>
                </span>
              </div>
              <div className="flex items-center">
                <User className="w-4 h-4 mr-2 text-indigo-500 flex-shrink-0" />
                <span>
                  Reported by:{' '}
                  <strong className="text-slate-800">
                    {item.reportedBy?.name || 'Campus Member'}
                  </strong>
                </span>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Description
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {item.description}
              </p>
            </div>

            {/* Hidden detail box (only visible if admin or reporter) */}
            {item.privateDetails && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-1">
                <div className="flex items-center text-xs font-bold text-amber-800 uppercase tracking-wider">
                  <Lock className="w-3.5 h-3.5 mr-1" />
                  Hidden Finder Detail (Admin / Reporter Only)
                </div>
                <p className="text-xs text-amber-900 font-medium">{item.privateDetails}</p>
              </div>
            )}
          </div>

          {/* Action Row */}
          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-3">
            {/* Found Item Claim Action */}
            {item.type === 'found' && !isOwner && item.status !== 'recovered' && item.status !== 'claimed' && (
              <>
                {userClaim ? (
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-600">Your Claim:</span>
                    <ClaimBadge status={userClaim.status} />
                    {userClaim.status === 'pending' && (
                      <button
                        onClick={handleWithdrawClaim}
                        className="text-xs text-rose-600 hover:underline font-bold ml-2"
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
                    className="flex-1 py-3 px-5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md shadow-teal-200 transition-all text-center flex items-center justify-center"
                  >
                    <ShieldCheck className="w-4 h-4 mr-2" />
                    Claim This Item
                  </button>
                )}
              </>
            )}

            {/* Owner/Admin: Edit Report */}
            {(isOwner || isAdmin) && (
              <button
                onClick={() => setEditModalOpen(true)}
                className="py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs flex items-center shadow-sm"
              >
                <Edit className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                Edit Report
              </button>
            )}

            {/* Admin: Mark as Recovered */}
            {isAdmin && item.status !== 'recovered' && (
              <button
                onClick={handleMarkRecovered}
                className="py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm transition-all flex items-center"
              >
                <CheckCircle2 className="w-4 h-4 mr-1.5" />
                Mark Recovered
              </button>
            )}

            {/* Owner/Admin Delete */}
            {(isOwner || isAdmin) && (
              <button
                onClick={handleDeleteItem}
                className="p-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors"
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
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-indigo-100 text-indigo-700">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Possible Match Suggestions
            </h2>
            <p className="text-xs text-slate-500">
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
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400 text-xs">
            No strong matches found yet for this report. As new items are reported, the engine will automatically notify you.
          </div>
        )}
      </div>

      {/* Claim Submission Modal */}
      {claimModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-100">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-black text-slate-900">Claim Verification</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Claiming: <strong className="text-slate-800">{item.title}</strong>
                </p>
              </div>
              <button
                onClick={() => setClaimModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {claimError && (
              <div className="p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
                {claimError}
              </div>
            )}

            {claimSuccess && (
              <div className="p-3 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                {claimSuccess}
              </div>
            )}

            <form onSubmit={handleClaimSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Describe Private / Hidden Proof Details <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe details only the real owner would know: wallpaper, ID digits, keychain style, contents inside zipper pocket, specific scratch or stickers..."
                  value={proofText}
                  onChange={(e) => setProofText(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                ></textarea>
                <p className="text-[11px] text-slate-400 mt-1">
                  This description is sent privately to the campus administrator to compare with the finder's stored detail.
                </p>
              </div>

              {userLostReports.length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Link One of Your Existing Lost Reports (Optional)
                  </label>
                  <select
                    value={selectedLostId}
                    onChange={(e) => setSelectedLostId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs focus:outline-none"
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
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingClaim || !proofText.trim()}
                  className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-200 transition-all disabled:opacity-50"
                >
                  {submittingClaim ? 'Submitting...' : 'Submit Claim'}
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
