import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Printer, X, ShieldCheck, MapPin, Calendar, User, Tag, Compass } from 'lucide-react';

export default function HandoverPassModal({ claim, onClose }) {
  if (!claim) return null;

  const foundItem = claim.foundItem || {};
  const claimant = claim.claimant || {};
  // Use VITE_APP_URL if set (e.g. your LAN IP or deployed URL), else fall back to current origin
  const appBase = import.meta.env.VITE_APP_URL || window.location.origin;
  const itemUrl = `${appBase}/items/${foundItem._id || ''}`;
  const verificationCode = `LX-V-${(claim._id || '').slice(-6).toUpperCase()}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      {/* Container with print isolation styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-handover-pass, #printable-handover-pass * {
            visibility: visible;
          }
          #printable-handover-pass {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 20px;
            border: 2px solid #000;
            box-shadow: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Top Bar (hidden during print) */}
        <div className="no-print px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2 text-indigo-600 font-bold text-sm">
            <Compass className="w-4 h-4" />
            <span>Campus Security Handover Pass</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Ticket Area */}
        <div id="printable-handover-pass" className="p-6 sm:p-8 space-y-6 overflow-y-auto">
          {/* Header */}
          <div className="flex items-start justify-between border-b-2 border-dashed border-slate-200 pb-5">
            <div>
              <div className="flex items-center space-x-1.5 text-indigo-600 font-black text-xl tracking-tight">
                <Compass className="w-6 h-6" />
                <span>Lost<span className="text-slate-900">X</span></span>
              </div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                Official Campus Property Recovery Pass
              </p>
            </div>

            <div className="text-right">
              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                Verified & Approved
              </span>
              <p className="text-[10px] text-slate-400 font-mono mt-1">Code: {verificationCode}</p>
            </div>
          </div>

          {/* QR Code and Item Snapshot */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center flex-shrink-0">
              <QRCodeSVG value={itemUrl} size={100} level="M" />
              <span className="text-[9px] text-slate-400 font-bold uppercase mt-1">Scan to Verify</span>
            </div>

            <div className="space-y-1.5 text-xs text-slate-600 flex-1 text-center sm:text-left">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600">
                {foundItem.category}
              </span>
              <h3 className="text-base font-black text-slate-900 leading-snug">
                {foundItem.title || 'Found Property'}
              </h3>
              <p className="flex items-center justify-center sm:justify-start text-slate-500 text-[11px]">
                <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
                Found at: <strong>{foundItem.location || 'Campus'}</strong>
              </p>
              <p className="flex items-center justify-center sm:justify-start text-slate-500 text-[11px]">
                <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                Claim Date: {new Date(claim.createdAt || Date.now()).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Handover Collection Box */}
          <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-emerald-950 space-y-1.5">
            <div className="text-[10px] font-black uppercase tracking-wider text-emerald-800 flex items-center">
              <MapPin className="w-3.5 h-3.5 mr-1 text-emerald-600" />
              Designated Collection / Handover Spot
            </div>
            <p className="text-sm font-black text-emerald-900">
              {foundItem.handoverInfo || 'Campus Security Main Desk'}
            </p>
            <p className="text-[11px] text-emerald-700 leading-relaxed">
              Show this pass (digital or printed) along with your college student or faculty ID card to collect the item.
            </p>
          </div>

          {/* Claimant Details */}
          <div className="grid grid-cols-2 gap-3 pt-2 text-xs border-t border-slate-100">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Verified Owner (Claimant)
              </span>
              <p className="font-bold text-slate-800">{claimant.name || 'Verified User'}</p>
              <p className="text-slate-500 text-[11px] truncate">{claimant.email || ''}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Claim Verification ID
              </span>
              <p className="font-mono text-slate-800 text-[11px] font-semibold truncate">
                {claim._id}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions (hidden during print) */}
        <div className="no-print px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            Close
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-200 transition-all active:scale-[0.98]"
          >
            <Printer className="w-4 h-4 mr-1.5" />
            Print / Save Pass
          </button>
        </div>
      </div>
    </div>
  );
}
