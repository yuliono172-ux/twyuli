import React from 'react';
import { Trash2, RefreshCw, X, ShieldAlert } from 'lucide-react';

interface ClearDatabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmClear: () => void;
  onRestoreSample: () => void;
  currentStudentCount: number;
  isSyncing?: boolean;
}

export const ClearDatabaseModal: React.FC<ClearDatabaseModalProps> = ({
  isOpen,
  onClose,
  onConfirmClear,
  onRestoreSample,
  currentStudentCount,
  isSyncing = false
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl border border-rose-200/90 w-full max-w-lg overflow-hidden animate-scaleUp">
        {/* Header Modal - Warning Red Tone */}
        <div className="bg-gradient-to-r from-rose-900 via-rose-800 to-rose-900 text-white p-5 flex items-center justify-between border-b border-rose-700/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-400/40 flex items-center justify-center text-rose-200 shadow-inner">
              <Trash2 className="w-5 h-5 text-rose-300" />
            </div>
            <div>
              <h3 className="text-base font-black uppercase tracking-wider text-white">
                KOSONGKAN DATABASE SISWA
              </h3>
              <p className="text-xs text-rose-200 font-medium">
                Pembersihan Data Peserta Didik & Penilaian
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSyncing}
            className="p-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-200 hover:text-white transition cursor-pointer disabled:opacity-50"
            title="Batal / Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Isi Modal */}
        <div className="p-6 space-y-4">
          <div className="bg-rose-50 border border-rose-200/90 rounded-2xl p-4 flex items-start gap-3.5">
            <ShieldAlert className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-xs text-rose-950 space-y-1">
              <span className="font-extrabold text-sm text-rose-900 block">
                Apakah Anda yakin ingin mengosongkan database?
              </span>
              <p className="leading-relaxed">
                Saat ini terdapat <strong>{currentStudentCount} peserta didik</strong> yang terdaftar. Tindakan ini akan menghapus seluruh data siswa, nilai 9 aspek, deskripsi rapor, dan rekap penilaian dari <strong>Firebase Realtime Database</strong> serta penyimpanan lokal.
              </p>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs text-slate-600 space-y-2">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <span>💡 Pilihan Pengosongan Database:</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-600 pl-1 text-[11.5px]">
              <li>
                <strong>Kosongkan Total (0 Siswa):</strong> Mengosongkan tabel hingga benar-benar bersih, siap untuk mengimpor data siswa baru dari Excel.
              </li>
              <li>
                <strong>Reset ke Data Contoh (10 Siswa Sample):</strong> Mengembalikan 10 data siswa simulasi awal jika hanya ingin mencoba ulang fitur aplikasi.
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <button
            type="button"
            disabled={isSyncing}
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold transition cursor-pointer order-3 sm:order-1"
          >
            Batal
          </button>

          <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto order-1 sm:order-2">
            <button
              type="button"
              disabled={isSyncing}
              onClick={() => {
                onRestoreSample();
                onClose();
              }}
              className="w-full sm:w-auto px-3.5 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
              title="Kembalikan data ke 10 siswa sampel bawaan"
            >
              <RefreshCw className="w-3.5 h-3.5 text-amber-700" />
              <span>Reset ke Siswa Contoh</span>
            </button>

            <button
              type="button"
              disabled={isSyncing}
              onClick={() => {
                onConfirmClear();
                onClose();
              }}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black flex items-center justify-center gap-2 shadow-md shadow-rose-900/20 transition cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>{isSyncing ? 'Mengosongkan...' : 'Kosongkan Sekarang (0 Siswa)'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
