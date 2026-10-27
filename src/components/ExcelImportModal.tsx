import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import {
  Upload,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertCircle,
  X,
  Clipboard,
  Info
} from 'lucide-react';
import { StudentRecord } from '../types/rapor';
import { createEmptyAssessmentRecord } from '../data/initialData';

interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (newStudents: StudentRecord[], mode: 'replace' | 'append') => void;
  currentStudentCount: number;
  defaultKelas?: string;
  defaultTahunAjaran?: string;
}

interface ParsedStudentRow {
  no: number;
  nama: string;
  nis: string;
  kelas: string;
  tahunAjaran: string;
  isValid: boolean;
  error?: string;
}

export const ExcelImportModal: React.FC<ExcelImportModalProps> = ({
  isOpen,
  onClose,
  onImport,
  currentStudentCount,
  defaultKelas = 'Kelas IV (Fase B)',
  defaultTahunAjaran = '2026/2027'
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [importMode, setImportMode] = useState<'replace' | 'append'>('replace');
  const [overrideKelas, setOverrideKelas] = useState<string>(defaultKelas);
  const [pasteText, setPasteText] = useState<string>('');
  const [parsedRows, setParsedRows] = useState<ParsedStudentRow[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  // Parser Pintar untuk Baris Teks (Mendukung Clipboard Excel \t, CSV ; Titik Koma, dan CSV , Koma)
  const parseRawText = (text: string): ParsedStudentRow[] => {
    if (!text.trim()) return [];

    const rawLines = text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (rawLines.length === 0) return [];

    // Deteksi Delimiter Baris Pertama: Tab (\t) lebih dominan jika disalin dari Excel
    const firstLine = rawLines[0];
    let delimiter = '\t';
    if (firstLine.includes('\t')) {
      delimiter = '\t';
    } else if (firstLine.includes(';')) {
      delimiter = ';';
    } else if (firstLine.includes(',')) {
      delimiter = ',';
    }

    // Split cell helper dengan penanganan tanda kutip ganda CSV
    const splitCells = (line: string, delim: string): string[] => {
      if (delim === '\t') {
        return line.split('\t').map((c) => c.replace(/^["']|["']$/g, '').trim());
      }
      // Simple regex split for CSV with potential quotes
      const regex = new RegExp(`(?:^|${delim})(?:"([^"]*)"|([^${delim}"]*))`, 'g');
      const cells: string[] = [];
      let match;
      while ((match = regex.exec(line)) !== null) {
        let val = match[1] !== undefined ? match[1] : match[2];
        if (val === undefined) val = '';
        cells.push(val.trim());
      }
      // Clean up empty trailing match if any
      if (cells.length === 0) {
        return line.split(delim).map((c) => c.replace(/^["']|["']$/g, '').trim());
      }
      return cells;
    };

    const matrix = rawLines.map((l) => splitCells(l, delimiter));
    return processMatrixToStudents(matrix);
  };

  // Memetakan Matrix 2D (Kolom Header dan Baris Data)
  const processMatrixToStudents = (matrix: string[][]): ParsedStudentRow[] => {
    if (matrix.length === 0) return [];

    let headerRowIndex = -1;
    let colNama = -1;
    let colNis = -1;
    let colKelas = -1;

    // 1. Cek apakah ada baris header (NO, NAMA, NIS, KELAS) di 3 baris pertama
    for (let r = 0; r < Math.min(matrix.length, 4); r++) {
      const row = matrix[r].map((c) => c.toLowerCase().replace(/[^a-z0-9]/g, ''));
      const hasNama = row.some((c) => c.includes('nama') || c.includes('pesertadidik') || c.includes('siswa') || c.includes('student'));
      const hasNis = row.some((c) => c.includes('nis') || c.includes('induk') || c.includes('nisn'));

      if (hasNama || hasNis) {
        headerRowIndex = r;
        row.forEach((cell, idx) => {
          if (cell.includes('nama') || cell.includes('peserta') || cell.includes('siswa')) colNama = idx;
          else if (cell.includes('nis') || cell.includes('induk')) colNis = idx;
          else if (cell.includes('kelas') || cell.includes('rombel') || cell.includes('tingkat')) colKelas = idx;
        });
        break;
      }
    }

    // Jika tidak ada header terdeteksi, gunakan urutan default berdasarkan jumlah kolom
    const dataStart = headerRowIndex >= 0 ? headerRowIndex + 1 : 0;
    const dataRows = matrix.slice(dataStart);

    const results: ParsedStudentRow[] = [];
    let autoSequence = importMode === 'append' ? currentStudentCount + 1 : 1;

    dataRows.forEach((row) => {
      // Lewati baris yang benar-benar kosong
      if (row.every((c) => !c || c.trim() === '')) return;

      let namaVal = '';
      let nisVal = '';
      let kelasVal = overrideKelas;

      if (headerRowIndex >= 0) {
        if (colNama >= 0 && row[colNama]) namaVal = row[colNama];
        if (colNis >= 0 && row[colNis]) nisVal = row[colNis];
        if (colKelas >= 0 && row[colKelas]) kelasVal = row[colKelas];
      } else {
        // Fallback heuristik kolom:
        if (row.length === 1) {
          // Hanya ada 1 kolom, anggap itu Nama Siswa
          namaVal = row[0];
        } else if (row.length === 2) {
          // 2 Kolom: Cek mana yang angka (NIS) dan mana yang huruf (Nama)
          const isFirstNum = /^\d+$/.test(row[0].replace(/[-.]/g, ''));
          if (isFirstNum) {
            nisVal = row[0];
            namaVal = row[1];
          } else {
            namaVal = row[0];
            nisVal = row[1];
          }
        } else if (row.length === 3) {
          // 3 Kolom: NO, NAMA, NIS atau NAMA, NIS, KELAS
          const isFirstNo = /^\d{1,3}$/.test(row[0]);
          if (isFirstNo) {
            namaVal = row[1];
            nisVal = row[2];
          } else {
            namaVal = row[0];
            nisVal = row[1];
            kelasVal = row[2];
          }
        } else {
          // 4+ Kolom: [0]=NO, [1]=NAMA, [2]=NIS, [3]=KELAS
          const parsedNo = parseInt(row[0], 10);
          if (!isNaN(parsedNo) && parsedNo > 0) {
            namaVal = row[1] || '';
            nisVal = row[2] || '';
            kelasVal = row[3] || overrideKelas;
          } else {
            namaVal = row[0] || '';
            nisVal = row[1] || '';
            kelasVal = row[2] || overrideKelas;
          }
        }
      }

      // Bersihkan nilai
      namaVal = namaVal.trim().toUpperCase();
      nisVal = nisVal.trim();
      if (!nisVal) {
        nisVal = `2023400${String(autoSequence).padStart(2, '0')}`;
      }

      const isValid = namaVal.length >= 2;
      const error = !isValid ? 'Nama peserta didik minimal 2 karakter' : undefined;

      results.push({
        no: autoSequence,
        nama: namaVal,
        nis: nisVal,
        kelas: kelasVal || overrideKelas,
        tahunAjaran: defaultTahunAjaran,
        isValid,
        error
      });

      autoSequence++;
    });

    return results;
  };

  // Handler Unggah File (.xlsx, .xls, .csv) Menggunakan SheetJS
  const handleFileUpload = (file: File) => {
    setParseError(null);
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) return;

        let matrix: string[][] = [];

        if (file.name.endsWith('.csv') || file.name.endsWith('.tsv') || file.name.endsWith('.txt')) {
          const text = typeof data === 'string' ? data : new TextDecoder('utf-8').decode(data as ArrayBuffer);
          const parsed = parseRawText(text);
          setParsedRows(parsed);
          return;
        }

        // File Excel Biner (.xlsx / .xls)
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // Konversi ke format array 2D string
        const rawJson: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
        matrix = rawJson.map((row) => row.map((cell) => String(cell !== null && cell !== undefined ? cell : '').trim()));

        const parsed = processMatrixToStudents(matrix);
        setParsedRows(parsed);

        if (parsed.length === 0) {
          setParseError('Tidak ditemukan data baris siswa yang valid di dalam file Excel.');
        }
      } catch (err: any) {
        console.error('Error membaca file Excel:', err);
        setParseError(`Gagal membaca file: ${err?.message || 'Format file tidak didukung'}`);
      }
    };

    if (file.name.endsWith('.csv') || file.name.endsWith('.txt') || file.name.endsWith('.tsv')) {
      reader.readAsText(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  };

  // Handler Paste Textarea Change
  const handlePasteChange = (text: string) => {
    setPasteText(text);
    setParseError(null);
    if (!text.trim()) {
      setParsedRows([]);
      return;
    }
    const parsed = parseRawText(text);
    setParsedRows(parsed);
  };

  // Unduh Format Template Excel (.xlsx) Resmi & Siap Pakai
  const handleDownloadExcelTemplate = () => {
    const templateData = [
      {
        NO: 1,
        'NAMA PESERTA DIDIK': 'AHMAD FAUZI PRATAMA',
        NIS: '202340001',
        KELAS: 'Kelas IV (Fase B)'
      },
      {
        NO: 2,
        'NAMA PESERTA DIDIK': 'BELLA SAFIRA ANGGRAENI',
        NIS: '202340002',
        KELAS: 'Kelas IV (Fase B)'
      },
      {
        NO: 3,
        'NAMA PESERTA DIDIK': 'CITRA DEWI LESTARI',
        NIS: '202340003',
        KELAS: 'Kelas IV (Fase B)'
      },
      {
        NO: 4,
        'NAMA PESERTA DIDIK': 'DIMAS ARYA KUSUMA',
        NIS: '202340004',
        KELAS: 'Kelas IV (Fase B)'
      },
      {
        NO: 5,
        'NAMA PESERTA DIDIK': 'ELISA PUTRI MAHARANI',
        NIS: '202340005',
        KELAS: 'Kelas IV (Fase B)'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    // Set column widths
    ws['!cols'] = [{ wch: 6 }, { wch: 32 }, { wch: 16 }, { wch: 22 }];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data_Siswa');
    XLSX.writeFile(wb, 'Format_Template_Database_Siswa.xlsx');
  };

  // Unduh Format Template CSV
  const handleDownloadCsvTemplate = () => {
    const csvContent =
      'NO,NAMA PESERTA DIDIK,NIS,KELAS\n' +
      '1,AHMAD FAUZI PRATAMA,202340001,Kelas IV (Fase B)\n' +
      '2,BELLA SAFIRA ANGGRAENI,202340002,Kelas IV (Fase B)\n' +
      '3,CITRA DEWI LESTARI,202340003,Kelas IV (Fase B)\n' +
      '4,DIMAS ARYA KUSUMA,202340004,Kelas IV (Fase B)\n' +
      '5,ELISA PUTRI MAHARANI,202340005,Kelas IV (Fase B)\n';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Format_Template_Database_Siswa.csv';
    a.click();
  };

  // Submit Final Impor
  const handleExecuteImport = () => {
    const validRows = parsedRows.filter((r) => r.isValid && r.nama.trim().length > 0);
    if (validRows.length === 0) {
      setParseError('Tidak ada data siswa yang valid untuk diimpor. Pastikan nama terisi.');
      return;
    }

    const startSeq = importMode === 'append' ? currentStudentCount + 1 : 1;
    const finalStudents: StudentRecord[] = validRows.map((r, idx) => ({
      no: startSeq + idx,
      nama: r.nama.toUpperCase().trim(),
      nis: r.nis.trim() || `2023400${String(startSeq + idx).padStart(2, '0')}`,
      kelas: r.kelas.trim() || overrideKelas,
      tahunAjaran: defaultTahunAjaran,
      triwulan: {
        T1: createEmptyAssessmentRecord(),
        T2: createEmptyAssessmentRecord(),
        T3: createEmptyAssessmentRecord(),
        T4: createEmptyAssessmentRecord()
      }
    }));

    onImport(finalStudents, importMode);
    onClose();
  };

  const validCount = parsedRows.filter((r) => r.isValid).length;
  const invalidCount = parsedRows.filter((r) => !r.isValid).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header Modal */}
        <div className="bg-[#0B1528] text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#1E5BF9] to-blue-500 flex items-center justify-center shadow-md border border-white/20">
              <FileSpreadsheet className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black uppercase tracking-wider text-white">
                IMPOR DATA SISWA DARI EXCEL / SPREADSHEET
              </h3>
              <p className="text-xs text-slate-300 font-medium">
                Mendukung file <code className="text-amber-300 font-mono">.xlsx</code>, <code className="text-amber-300 font-mono">.xls</code>, <code className="text-amber-300 font-mono">.csv</code>, dan salin-tempel langsung dari tabel Excel.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
            title="Tutup dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Konten Scrollable */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Banner Bantuan & Download Template */}
          <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 border border-blue-200/90 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-[#1E5BF9] shrink-0 mt-0.5" />
              <div className="text-xs text-slate-700">
                <span className="font-extrabold text-slate-900 block mb-0.5">
                  Format Header Kolom Standar:
                </span>
                <div className="flex flex-wrap gap-1.5 mt-1 font-mono text-[11px]">
                  <span className="px-2 py-0.5 rounded-md bg-white border border-blue-200 text-blue-900 font-bold">
                    NO
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-white border border-blue-200 text-blue-900 font-bold">
                    NAMA PESERTA DIDIK
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-white border border-blue-200 text-blue-900 font-bold">
                    NIS
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-white border border-blue-200 text-blue-900 font-bold">
                    KELAS
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Sistem otomatis mendeteksi header tabel dan membagi kolom per sel dengan rapi (tidak menjadi 1 cell).
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDownloadExcelTemplate}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                title="Download file contoh format Microsoft Excel"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Template (.xlsx)</span>
              </button>
              <button
                type="button"
                onClick={handleDownloadCsvTemplate}
                className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                title="Download template file CSV"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Template (.csv)</span>
              </button>
            </div>
          </div>

          {/* Tab Selector: Upload File vs Paste Clipboard */}
          <div className="flex items-center border-b border-slate-200 gap-2">
            <button
              onClick={() => setActiveTab('upload')}
              className={`px-4 py-2.5 text-xs font-black uppercase tracking-wider flex items-center gap-2 border-b-2 transition cursor-pointer ${
                activeTab === 'upload'
                  ? 'border-[#1E5BF9] text-[#1E5BF9]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>Unggah File Excel (.xlsx / .csv)</span>
            </button>
            <button
              onClick={() => setActiveTab('paste')}
              className={`px-4 py-2.5 text-xs font-black uppercase tracking-wider flex items-center gap-2 border-b-2 transition cursor-pointer ${
                activeTab === 'paste'
                  ? 'border-[#1E5BF9] text-[#1E5BF9]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Clipboard className="w-4 h-4" />
              <span>Paste Clipboard dari Excel</span>
            </button>
          </div>

          {/* Area Input Sesuai Tab */}
          {activeTab === 'upload' ? (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                const file = e.dataTransfer.files?.[0];
                if (file) handleFileUpload(file);
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-3xl p-6 sm:p-8 text-center transition cursor-pointer flex flex-col items-center justify-center gap-3 ${
                isDragging
                  ? 'border-blue-500 bg-blue-50/60 scale-[1.01]'
                  : 'border-slate-300 hover:border-blue-400 bg-slate-50/50 hover:bg-slate-50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls, .csv, .tsv"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                }}
              />
              <div className="w-14 h-14 rounded-2xl bg-blue-100 text-[#1E5BF9] flex items-center justify-center shadow-inner">
                <Upload className="w-7 h-7" />
              </div>
              <div>
                <p className="text-sm font-black text-slate-800">
                  {fileName ? (
                    <span className="text-emerald-700 flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> File terpilih: {fileName}
                    </span>
                  ) : (
                    'Klik untuk memilih file atau tarik (drag & drop) ke sini'
                  )}
                </p>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  Format yang didukung: <strong>.XLSX, .XLS, .CSV</strong> (Ukuran maks. 10MB)
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>Tempelkan Salinan Data dari Excel di Sini:</span>
                <span className="text-[11px] text-slate-500 font-normal">
                  Tekan <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-300 rounded text-[10px] font-mono">Ctrl+V</kbd>
                </span>
              </label>
              <textarea
                rows={6}
                value={pasteText}
                onChange={(e) => handlePasteChange(e.target.value)}
                placeholder={`Contoh salinan tabel Excel (pisahkan baris per enter):\nNO\tNAMA PESERTA DIDIK\tNIS\tKELAS\n1\tAHMAD FAUZI PRATAMA\t202340001\tKelas IV (Fase B)\n2\tBELLA SAFIRA ANGGRAENI\t202340002\tKelas IV (Fase B)`}
                className="w-full text-xs font-mono p-3 bg-slate-50 border border-slate-300 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none text-slate-900"
              />
            </div>
          )}

          {/* Opsi Pengaturan Impor */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Metode Impor Database:
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 p-2 rounded-xl bg-white border border-slate-200 text-xs font-bold cursor-pointer hover:border-blue-400">
                  <input
                    type="radio"
                    name="importMode"
                    value="replace"
                    checked={importMode === 'replace'}
                    onChange={() => setImportMode('replace')}
                    className="text-[#1E5BF9]"
                  />
                  <div>
                    <span className="text-slate-900 block">Ganti Semua Data (Replace)</span>
                    <span className="text-[10.5px] text-slate-500 font-normal">
                      Mengganti database siswa saat ini ({currentStudentCount} siswa) dengan data yang baru diimpor.
                    </span>
                  </div>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-xl bg-white border border-slate-200 text-xs font-bold cursor-pointer hover:border-blue-400">
                  <input
                    type="radio"
                    name="importMode"
                    value="append"
                    checked={importMode === 'append'}
                    onChange={() => setImportMode('append')}
                    className="text-[#1E5BF9]"
                  />
                  <div>
                    <span className="text-slate-900 block">Tambahkan ke Data Lama (Append)</span>
                    <span className="text-[10.5px] text-slate-500 font-normal">
                      Menambahkan siswa baru setelah siswa no. {currentStudentCount}.
                    </span>
                  </div>
                </label>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Default Kelas Jika Kolom Kosong:
              </label>
              <input
                type="text"
                value={overrideKelas}
                onChange={(e) => setOverrideKelas(e.target.value)}
                placeholder="Contoh: Kelas IV (Fase B)"
                className="w-full text-xs font-bold p-2.5 bg-white border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none text-slate-900"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Jika di file Excel kolom KELAS kosong, nilai ini yang akan otomatis digunakan.
              </p>
            </div>
          </div>

          {/* Pesan Error Parsing */}
          {parseError && (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3.5 flex items-center gap-3 text-rose-800 text-xs font-bold">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{parseError}</span>
            </div>
          )}

          {/* PREVIEW HASIL PARSING TABEL EXCEL */}
          {parsedRows.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase text-slate-800">
                    Pratinjau Hasil Impor Tabel ({parsedRows.length} Siswa Terdeteksi):
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    {validCount} Siap Impor
                  </span>
                  {invalidCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold">
                      {invalidCount} Perlu Perbaikan
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-slate-500 font-mono">
                  Menampilkan maks. 15 baris
                </span>
              </div>

              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs max-h-60 overflow-y-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead className="bg-[#0B1528] text-white font-bold text-[11px] uppercase tracking-wider sticky top-0 z-10">
                    <tr>
                      <th className="p-2.5 w-12 text-center border-r border-slate-800">NO</th>
                      <th className="p-2.5 border-r border-slate-800">NAMA PESERTA DIDIK</th>
                      <th className="p-2.5 w-32 border-r border-slate-800 text-center">NIS</th>
                      <th className="p-2.5 w-36 border-r border-slate-800 text-center">KELAS</th>
                      <th className="p-2.5 w-24 text-center">STATUS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {parsedRows.slice(0, 15).map((row, idx) => (
                      <tr key={idx} className={row.isValid ? 'hover:bg-slate-50' : 'bg-rose-50/50'}>
                        <td className="p-2 text-center font-mono font-bold text-slate-500 border-r border-slate-100">
                          {row.no}
                        </td>
                        <td className="p-2 font-bold text-slate-900 border-r border-slate-100 uppercase">
                          {row.nama || <span className="text-rose-500 italic font-normal">Nama Kosong!</span>}
                        </td>
                        <td className="p-2 text-center font-mono text-slate-700 border-r border-slate-100">
                          {row.nis}
                        </td>
                        <td className="p-2 text-center text-slate-700 border-r border-slate-100">
                          {row.kelas}
                        </td>
                        <td className="p-2 text-center font-bold text-[10px]">
                          {row.isValid ? (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                              Valid
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800" title={row.error}>
                              Error
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500">
            {parsedRows.length > 0 ? (
              <span>
                Total <strong>{validCount}</strong> peserta didik valid akan di-
                <strong>{importMode === 'replace' ? 'timpa (replace)' : 'tambahkan (append)'}</strong> ke database.
              </span>
            ) : (
              <span>Pilih file Excel atau tempel teks dari clipboard untuk melihat pratinjau.</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              disabled={validCount === 0}
              onClick={handleExecuteImport}
              className="px-5 py-2.5 rounded-xl bg-[#1E5BF9] hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-black flex items-center gap-2 shadow-md shadow-blue-900/20 transition cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {importMode === 'replace'
                  ? `Simpan & Ganti Database (${validCount} Siswa)`
                  : `Tambahkan ${validCount} Siswa`}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
