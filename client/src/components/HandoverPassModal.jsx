import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Printer, X, ShieldCheck, MapPin, Calendar, Compass } from 'lucide-react';

export default function HandoverPassModal({ claim, onClose }) {
  if (!claim) return null;

  const foundItem = claim.foundItem || {};
  const claimant = claim.claimant || {};
  const appBase = import.meta.env.VITE_APP_URL || window.location.origin;
  const itemUrl = `${appBase}/items/${foundItem._id || ''}`;
  const verificationCode = `LX-V-${(claim._id || '').slice(-6).toUpperCase()}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-reveal">
      {/* Container with print isolation styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-handover-pass, #printable-handover-pass * {
            visibility: visible;
            color: #0f172a !important;
            background: #ffffff !important;
            border-color: #cbd5e1 !important;
          }
          #printable-handover-pass {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 20px;
            border: 2px solid #000 !important;
            box-shadow: none !important;
            background: #ffffff !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="bg-white rounded-xl max-w-lg w-full shadow-md border border-[#E4E6EF] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Top Bar (hidden during print) */}
        <div className="no-print px-6 py-4 border-b border-[#E4E6EF] bg-[#F7F8FC] flex items-center justify-between">
          <div className="flex items-center space-x-2 text-brand-600 font-semibold text-sm">
            <Compass className="w-4 h-4" />
            <span>Campus Security Handover Pass</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Ticket Area */}
        <div id="printable-handover-pass" className="p-6 sm:p-8 space-y-6 overflow-y-auto">
          {/* Header */}
          <div className="flex items-start justify-between border-b border-dashed border-[#E4E6EF] pb-5">
            <div>
              <div className="flex items-center space-x-2 text-brand-600 font-bold text-xl tracking-tight">
                <Compass className="w-6 h-6" />
                <span>Lost<span className="text-gray-900">X</span></span>
              </div>
              <p className="text-[11px] font-medium text-gray-400 uppercase tracking-widest mt-1">
                Official Campus Property Recovery Pass
              </p>
            </div>

            <div className="text-right">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                Verified & Approved
              </span>
              <p className="text-[10px] text-gray-400 font-mono mt-1.5">Code: {verificationCode}</p>
            </div>
          </div>

          {/* QR Code and Item Snapshot */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 p-4 rounded-xl bg-[#F7F8FC] border border-[#E4E6EF]">
            <div className="bg-white p-2.5 rounded-lg shadow-sm border border-[#E4E6EF] flex flex-col items-center flex-shrink-0">
              <QRCodeSVG value={itemUrl} size={100} level="M" />
              <span className="text-[9px] text-gray-500 font-bold uppercase mt-1">Scan to Verify</span>
            </div>

            <div className="space-y-1.5 text-xs text-gray-600 flex-1 text-center sm:text-left">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-brand-600">
                {foundItem.category}
              </span>
              <h3 className="text-base font-bold text-gray-900 leading-snug">
                {foundItem.title || 'Found Property'}
              </h3>
              <p className="flex items-center justify-center sm:justify-start text-gray-500 text-[11px]">
                <MapPin className="w-3.5 h-3.5 mr-1 text-gray-400" />
                Found at: <strong className="text-gray-900 ml-1">{foundItem.location || 'Campus'}</strong>
              </p>
              <p className="flex items-center justify-center sm:justify-start text-gray-500 text-[11px]">
                <Calendar className="w-3.5 h-3.5 mr-1 text-gray-400" />
                Claim date: {new Date(claim.createdAt || Date.now()).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Handover Collection Box */}
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-1.5">
            <div className="text-[11px] font-semibold text-emerald-700 flex items-center">
              <MapPin className="w-3.5 h-3.5 mr-1 text-emerald-600" />
              Designated collection / handover spot
            </div>
            <p className="text-sm font-bold text-emerald-950">
              {foundItem.handoverInfo || 'Campus Security Main Desk'}
            </p>
            <p className="text-[11px] text-emerald-700 leading-relaxed">
              Show this pass (digital or printed) along with your college student or faculty ID card to collect the item.
            </p>
          </div>

          {/* Claimant Details */}
          <div className="grid grid-cols-2 gap-3 pt-3 text-xs border-t border-[#E4E6EF]">
            <div>
              <span className="text-[11px] font-medium text-gray-400 block mb-0.5">
                Verified owner (claimant)
              </span>
              <p className="font-semibold text-gray-900">{claimant.name || 'Verified User'}</p>
              <p className="text-gray-500 text-[11px] truncate">{claimant.email || ''}</p>
            </div>
            <div>
              <span className="text-[11px] font-medium text-gray-400 block mb-0.5">
                Claim verification ID
              </span>
              <p className="font-mono text-gray-700 text-[11px] truncate">
                {claim._id}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions (hidden during print) */}
        <div className="no-print px-6 py-4 border-t border-[#E4E6EF] bg-[#F7F8FC] flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          >
            Close
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center px-5 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-sm transition-colors"
          >
            <Printer className="w-4 h-4 mr-1.5" />
            Print / Save pass
          </button>
        </div>
      </div>
    </div>
  );
}
