import React, { useState } from 'react';
import {
  StudentRecord,
  TriwulanKey,
  TRIWULAN_OPTIONS,
  ASPEK_LIST,
  QuarterComparisonItem
} from '../types/rapor';
import {
  compareTwoQuarters,
  getAllQuartersComparison
} from '../utils/quarterAnalysis';
import {
  ChevronLeft,
  Printer,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Activity,
  BarChart3,
  Compass,
  CheckCircle2,
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronUp,
  Sparkles,
  User,
  Calendar,
  Layers,
  Award
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend as RechartsLegend,
  ReferenceLine
} from 'recharts';

interface PerbandinganTriwulanProps {
  students: StudentRecord[];
  selectedStudentNo: number;
  onSelectStudent: (no: number) => void;
  onNavigateHome: () => void;
}

export const PerbandinganTriwulan: React.FC<PerbandinganTriwulanProps> = ({
  students,
  selectedStudentNo,
  onSelectStudent,
  onNavigateHome
}) => {
  const safeStudents = students || [];
  const currentStudent = safeStudents.find((s) => s.no === selectedStudentNo) || safeStudents[0];

  // Comparison modes: 2 quarters vs all quarters
  const [comparisonMode, setComparisonMode] = useState<'two_quarters' | 'all_quarters'>('two_quarters');
  const [periodA, setPeriodA] = useState<TriwulanKey>('T1');
  const [periodB, setPeriodB] = useState<TriwulanKey>('T2');

  // Chart settings
  const [chartViewMode, setChartViewMode] = useState<'rerata' | 'dimension' | 'multiline'>('rerata');
  const [selectedChartAspectId, setSelectedChartAspectId] = useState<string>('kognitif');

  // Accordion state for indicators drilldown
  const [expandedAspects, setExpandedAspects] = useState<Record<string, boolean>>({
    kognitif: true,
    afektif: true
  });

  const toggleAspect = (aspectId: string) => {
    setExpandedAspects((prev) => ({
      ...prev,
      [aspectId]: !prev[aspectId]
    }));
  };

  const expandAllAspects = () => {
    const all: Record<string, boolean> = {};
    ASPEK_LIST.forEach((a) => {
      all[a.id] = true;
    });
    setExpandedAspects(all);
  };

  const collapseAllAspects = () => {
    setExpandedAspects({});
  };

  // Preset comparison handler (Requirement 9)
  const setPreset = (a: TriwulanKey, b: TriwulanKey) => {
    setComparisonMode('two_quarters');
    setPeriodA(a);
    setPeriodB(b);
  };

  // Early return if no student data
  if (!currentStudent) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center space-y-4">
        <h3 className="text-lg font-bold text-slate-800">Tidak ada data siswa tersedia</h3>
        <p className="text-sm text-slate-500">Silakan tambahkan data siswa terlebih dahulu di Database Siswa.</p>
        <button
          onClick={onNavigateHome}
          className="px-4 py-2 bg-[#1E5BF9] text-white rounded-xl text-xs font-bold"
        >
          Kembali ke Dashboard
        </button>
      </div>
    );
  }

  // Calculations
  const comparison = compareTwoQuarters(currentStudent, periodA, periodB);
  const allQuarters = getAllQuartersComparison(currentStudent);

  // Colors for multiline chart
  const ASPECT_LINE_COLORS: Record<string, string> = {
    kognitif: '#eab308',
    afektif: '#3b82f6',
    psikomotor: '#ef4444',
    sosial: '#64748b',
    islamicLiteracy: '#a855f7',
    bilingual: '#06b6d4',
    talents: '#0284c7',
    experience: '#f97316',
    inklusivitas: '#84cc16'
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/90 p-4 sm:p-7 space-y-6 animate-fadeIn">
      {/* 1. HEADER HALAMAN & KONTROL NAVIGASI */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5 print:hidden">
        <div className="flex items-center gap-3">
          <button
            onClick={onNavigateHome}
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-2 border border-slate-300 shadow-xs transition cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 text-slate-600" />
            HOME
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[#1E5BF9] border border-blue-200 text-[11px] font-bold">
                SISTEM KOMPARASI PERIODE
              </span>
              <h2 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-tight">
                PERBANDINGAN TREN NILAI ANTAR-TRIWULAN
              </h2>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Analisis komparatif 9 dimensi perkembangan dan 32 indikator penilaian (Triwulan 1 s/d 4)
            </p>
          </div>
        </div>

        {/* Pemilih Siswa & Tombol Cetak */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-600 hidden sm:inline">Pilih Siswa:</span>
          <button
            onClick={() => {
              if (selectedStudentNo > 1) onSelectStudent(selectedStudentNo - 1);
            }}
            disabled={selectedStudentNo <= 1}
            className="px-3 py-2 text-xs font-bold border border-slate-200 rounded-xl bg-slate-50 disabled:opacity-30 hover:bg-slate-100 cursor-pointer transition shadow-2xs"
            title="Siswa Sebelumnya"
          >
            ◀
          </button>

          <select
            value={selectedStudentNo}
            onChange={(e) => onSelectStudent(Number(e.target.value))}
            className="px-3.5 py-2 text-xs font-bold border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#1E5BF9] focus:outline-none max-w-[280px] truncate shadow-2xs cursor-pointer transition"
          >
            {students.map((s) => (
              <option key={s.no} value={s.no}>
                {s.no}. {s.nama} ({s.nis})
              </option>
            ))}
          </select>

          <button
            onClick={() => {
              if (selectedStudentNo < students.length) onSelectStudent(selectedStudentNo + 1);
            }}
            disabled={selectedStudentNo >= students.length}
            className="px-3 py-2 text-xs font-bold border border-slate-200 rounded-xl bg-slate-50 disabled:opacity-30 hover:bg-slate-100 cursor-pointer transition shadow-2xs"
            title="Siswa Berikutnya"
          >
            ▶
          </button>

          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-[#1E5BF9] hover:bg-blue-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-blue-900/20 transition cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" /> Cetak Laporan
          </button>
        </div>
      </div>

      {/* IDENTITAS SISWA TERPILIH */}
      <div className="bg-slate-50/90 border border-slate-200 rounded-2xl p-4 text-xs">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-[#1E5BF9] flex items-center justify-center shrink-0">
              <User className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Nama Peserta Didik</span>
              <span className="font-black text-slate-900 uppercase text-xs sm:text-sm">{currentStudent.nama}</span>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 font-mono font-bold text-xs">
              NIS
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Nomor Induk (NIS)</span>
              <span className="font-mono font-bold text-slate-800">{currentStudent.nis}</span>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Kelas & Fase</span>
              <span className="font-bold text-slate-800">{currentStudent.kelas} (Fase B)</span>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Tahun Pelajaran</span>
              <span className="font-bold text-emerald-700">{currentStudent.tahunAjaran}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. PANEL PILIHAN PERBANDINGAN: Deep Navy Modern Theme */}
      <div className="bg-[#0B1528] p-4 sm:p-5 rounded-2xl border border-slate-800 text-white shadow-md print:hidden space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#1E5BF9] flex items-center justify-center text-white text-base shadow">
              ⚖️
            </div>
            <div>
              <h3 className="font-bold text-sm uppercase tracking-wide text-white">
                PILIHAN MODE PERBANDINGAN TRIWULAN
              </h3>
              <p className="text-[11px] text-slate-400">
                Pilih opsi preset perbandingan atau atur periode khusus sesuai kebutuhan:
              </p>
            </div>
          </div>
          <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
            {comparisonMode === 'two_quarters'
              ? `Komparasi: ${comparison.periodeA.label} vs ${comparison.periodeB.label}`
              : 'Komparasi: Seluruh Periode (T1 → T2 → T3 → T4)'}
          </span>
        </div>

        {/* Preset Buttons */}
        <div className="space-y-2">
          <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">
            Pilihan Perbandingan Cepat (Preset):
          </span>
          <div className="flex flex-wrap gap-2">
            {[
              { a: 'T1' as TriwulanKey, b: 'T2' as TriwulanKey, label: 'Triwulan 1 vs 2' },
              { a: 'T2' as TriwulanKey, b: 'T3' as TriwulanKey, label: 'Triwulan 2 vs 3' },
              { a: 'T3' as TriwulanKey, b: 'T4' as TriwulanKey, label: 'Triwulan 3 vs 4' },
              { a: 'T1' as TriwulanKey, b: 'T3' as TriwulanKey, label: 'Triwulan 1 vs 3' },
              { a: 'T1' as TriwulanKey, b: 'T4' as TriwulanKey, label: 'Triwulan 1 vs 4' },
              { a: 'T2' as TriwulanKey, b: 'T4' as TriwulanKey, label: 'Triwulan 2 vs 4' },
            ].map((p) => {
              const isActive = comparisonMode === 'two_quarters' && periodA === p.a && periodB === p.b;
              return (
                <button
                  key={`${p.a}-${p.b}`}
                  onClick={() => setPreset(p.a, p.b)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                    isActive
                      ? 'bg-[#1E5BF9] text-white border-blue-400/60 shadow-md ring-2 ring-blue-400/40'
                      : 'bg-slate-800/80 text-slate-300 border-slate-700/80 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  {p.label}
                </button>
              );
            })}

            <button
              onClick={() => setComparisonMode('all_quarters')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border flex items-center gap-1.5 ${
                comparisonMode === 'all_quarters'
                  ? 'bg-emerald-600 text-white border-emerald-400 shadow-md ring-2 ring-emerald-400/40'
                  : 'bg-slate-800/80 text-emerald-300 border-emerald-800/60 hover:bg-slate-700'
              }`}
            >
              <span>📊 Bandingkan Semua Triwulan (T1 → T2 → T3 → T4)</span>
            </button>
          </div>
        </div>

        {/* Custom Period Selectors */}
        {comparisonMode === 'two_quarters' && (
          <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            {/* PERIODE A */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-amber-400 block">
                PERIODE A (Dasar Evaluasi):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {TRIWULAN_OPTIONS.map((t) => (
                  <button
                    key={`periodA-${t.id}`}
                    onClick={() => setPeriodA(t.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                      periodA === t.id
                        ? 'bg-amber-500 text-slate-950 border-amber-300 shadow ring-1 ring-amber-300'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* PERIODE B */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-blue-400 block">
                PERIODE B (Periode Capaian):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {TRIWULAN_OPTIONS.map((t) => (
                  <button
                    key={`periodB-${t.id}`}
                    onClick={() => setPeriodB(t.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                      periodB === t.id
                        ? 'bg-[#1E5BF9] text-white border-blue-400 shadow ring-1 ring-blue-300'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. RINGKASAN PERKEMBANGAN SISWA */}
      {comparisonMode === 'two_quarters' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#1E5BF9]" />
              <h3 className="font-black text-sm sm:text-base text-slate-900 uppercase tracking-wide">
                RINGKASAN PERKEMBANGAN SISWA ({comparison.periodeA.label} VS {comparison.periodeB.label})
              </h3>
            </div>
            <span className="text-xs font-bold text-slate-500">
              Evaluasi 9 Dimensi Lengkap
            </span>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            {/* Card Naik */}
            <div className="bg-white border border-emerald-200 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-emerald-800 uppercase">
                  Mengalami Kenaikan
                </span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-emerald-700 my-1">
                {comparison.naikCount} <span className="text-xs font-bold text-emerald-900">Dimensi</span>
              </div>
              <span className="text-[10px] text-emerald-600 font-medium block">
                Capaian meningkat positif
              </span>
            </div>

            {/* Card Stagnan */}
            <div className="bg-white border border-blue-200 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-blue-800 uppercase">
                  Stagnan (Tetap)
                </span>
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Activity className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-blue-700 my-1">
                {comparison.stagnanCount} <span className="text-xs font-bold text-blue-900">Dimensi</span>
              </div>
              <span className="text-[10px] text-blue-600 font-medium block">
                Konsisten stabil sesuai periode lalu
              </span>
            </div>

            {/* Card Turun */}
            <div className="bg-white border border-rose-200 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-rose-800 uppercase">
                  Mengalami Penurunan
                </span>
                <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <TrendingDown className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-rose-700 my-1">
                {comparison.turunCount} <span className="text-xs font-bold text-rose-900">Dimensi</span>
              </div>
              <span className="text-[10px] text-rose-600 font-medium block">
                Perlu fokus pendampingan
              </span>
            </div>

            {/* Card Delta Rerata */}
            <div className={`border rounded-2xl p-4 shadow-sm ${
              comparison.statusRerata === 'NAIK'
                ? 'bg-white border-teal-300 text-teal-950'
                : comparison.statusRerata === 'TURUN'
                ? 'bg-white border-amber-300 text-amber-950'
                : 'bg-white border-slate-200 text-slate-900'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase text-slate-600">
                  Pertumbuhan Rerata
                </span>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg ${
                  comparison.statusRerata === 'NAIK'
                    ? 'bg-emerald-100 text-emerald-800'
                    : comparison.statusRerata === 'TURUN'
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-slate-100 text-slate-800'
                }`}>
                  {comparison.statusRerata}
                </span>
              </div>
              <div className="text-xl font-black my-1 flex items-center gap-1">
                <span>{comparison.selisihRerata >= 0 ? `+${comparison.selisihRerata}` : comparison.selisihRerata}</span>
                <span className="text-xs font-bold text-slate-500">
                  ({comparison.persenRerata >= 0 ? `+${comparison.persenRerata}` : comparison.persenRerata}%)
                </span>
              </div>
              <span className="text-[10px] text-slate-500 font-medium block">
                Dari {comparison.rerataA} ke {comparison.rerataB} (skala 5.0)
              </span>
            </div>
          </div>

          {/* Highlight Aspek & Indikator dengan Perubahan Terbesar */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
            {/* Kenaikan Terbesar */}
            <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3">
              <span className="text-2xl">🏆</span>
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-emerald-800 uppercase block">
                  ASPEK DENGAN KENAIKAN TERBESAR:
                </span>
                <div className="font-black text-slate-900 text-sm">
                  {comparison.highestGrowthAspect.nama}{' '}
                  <span className="text-emerald-700 font-bold">
                    ({comparison.highestGrowthAspect.selisih >= 0 ? `+${comparison.highestGrowthAspect.selisih}` : comparison.highestGrowthAspect.selisih})
                  </span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Indikator terkuat: <strong>{comparison.highestGrowthIndicator.nama}</strong> ({comparison.highestGrowthIndicator.selisih >= 0 ? `+${comparison.highestGrowthIndicator.selisih}` : comparison.highestGrowthIndicator.selisih})
                </p>
              </div>
            </div>

            {/* Penurunan / Area Bimbingan Terbesar */}
            <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
              <span className="text-2xl">🎯</span>
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-amber-900 uppercase block">
                  ASPEK DENGAN PENURUNAN TERBESAR / FOKUS BIMBINGAN:
                </span>
                <div className="font-black text-slate-900 text-sm">
                  {comparison.biggestDropAspect.nama}{' '}
                  <span className={comparison.biggestDropAspect.selisih < 0 ? 'text-rose-700 font-bold' : 'text-slate-700 font-bold'}>
                    ({comparison.biggestDropAspect.selisih >= 0 ? `+${comparison.biggestDropAspect.selisih}` : comparison.biggestDropAspect.selisih})
                  </span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Indikator prioritas pendampingan: <strong>{comparison.biggestDropIndicator.nama}</strong> ({comparison.biggestDropIndicator.selisih >= 0 ? `+${comparison.biggestDropIndicator.selisih}` : comparison.biggestDropIndicator.selisih})
                </p>
              </div>
            </div>
          </div>

          {/* DESKRIPSI OTOMATIS */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-wide">
              <Info className="w-4 h-4 text-[#1E5BF9]" />
              <span>DESKRIPSI OTOMATIS REFLEKSI PERKEMBANGAN SISWA:</span>
            </div>
            <p className="text-xs text-slate-800 leading-relaxed font-medium bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
              "{comparison.deskripsiOtomatis}"
            </p>
          </div>
        </div>
      )}

      {/* 5. TAMPILAN GRAFIK PERKEMBANGAN DENGAN RECHARTS */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 space-y-4 shadow-sm print:break-inside-avoid">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-blue-50 text-[#1E5BF9]">
                <TrendingUp className="w-4 h-4" />
              </span>
              <h4 className="font-black text-sm sm:text-base text-slate-900 uppercase tracking-wide">
                GRAFIK PERKEMBANGAN NILAI SISWA (RECHARTS)
              </h4>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Visualisasi tren perkembangan nilai berdasarkan data riil dari Triwulan 1 s/d Triwulan 4 (Skala 1.0 - 5.0)
            </p>
          </div>

          {/* Mode Switcher Grafis */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 shadow-2xs print:hidden">
            <button
              onClick={() => setChartViewMode('rerata')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                chartViewMode === 'rerata'
                  ? 'bg-white text-[#1E5BF9] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Rerata Keseluruhan</span>
            </button>
            <button
              onClick={() => setChartViewMode('dimension')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                chartViewMode === 'dimension'
                  ? 'bg-white text-[#1E5BF9] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Per Aspek Dimensi</span>
            </button>
            <button
              onClick={() => setChartViewMode('multiline')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                chartViewMode === 'multiline'
                  ? 'bg-white text-[#1E5BF9] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Semua 9 Dimensi</span>
            </button>
          </div>
        </div>

        {/* Pemilih Aspek jika Mode 'dimension' aktif */}
        {chartViewMode === 'dimension' && (
          <div className="flex flex-wrap items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200 print:hidden text-xs">
            <span className="font-bold text-slate-700">Pilih Dimensi Perkembangan:</span>
            <select
              value={selectedChartAspectId}
              onChange={(e) => setSelectedChartAspectId(e.target.value)}
              className="px-3 py-1.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 cursor-pointer text-xs focus:ring-2 focus:ring-[#1E5BF9] focus:outline-none"
            >
              {ASPEK_LIST.map((asp) => (
                <option key={asp.id} value={asp.id}>
                  Dimensi {asp.no}: {asp.nama} ({asp.kategori})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Area Grafik Recharts */}
        <div className="bg-slate-50/50 p-3 sm:p-4 rounded-xl border border-slate-100">
          {allQuarters.chartData.some((d) => !d.hasData) && (
            <div className="mb-2 p-2 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                Catatan: Beberapa periode belum memiliki input nilai lengkap (ditandai 'Data belum tersedia' dan tidak dihitung nol).
              </span>
            </div>
          )}

          <div className="w-full h-[260px] sm:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              {chartViewMode === 'rerata' ? (
                <AreaChart
                  data={allQuarters.chartData}
                  margin={{ top: 15, right: 20, left: -20, bottom: 5 }}
                >
                  <defs>
                    <linearGradient id="colorRerata" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="5%" stopColor="#1E5BF9" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#1E5BF9" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="label" stroke="#64748b" tick={{ fontSize: 11, fontWeight: 'bold' }} />
                  <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} stroke="#64748b" tick={{ fontSize: 11 }} />
                  <RechartsTooltip
                    formatter={(val: any) => [val !== null ? `${val} / 5.0` : 'Data belum tersedia', 'Rerata Nilai']}
                    contentStyle={{ backgroundColor: '#0B1528', color: '#fff', borderRadius: '12px', fontSize: '12px', border: 'none' }}
                  />
                  <ReferenceLine
                    y={3.5}
                    stroke="#f59e0b"
                    strokeDasharray="4 4"
                    label={{ value: 'KKM 3.5', position: 'insideTopLeft', fill: '#d97706', fontSize: 10, fontWeight: 'bold' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="rerata"
                    name="Rerata Skor"
                    stroke="#1E5BF9"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorRerata)"
                    dot={{ r: 6, fill: '#1E5BF9', stroke: '#ffffff', strokeWidth: 2 }}
                    activeDot={{ r: 8, fill: '#0B1528', stroke: '#ffffff', strokeWidth: 2 }}
                    connectNulls={false}
                  />
                </AreaChart>
              ) : chartViewMode === 'dimension' ? (
                <LineChart
                  data={allQuarters.chartData}
                  margin={{ top: 15, right: 20, left: -20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="label" stroke="#64748b" tick={{ fontSize: 11, fontWeight: 'bold' }} />
                  <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} stroke="#64748b" tick={{ fontSize: 11 }} />
                  <RechartsTooltip
                    formatter={(val: any) => [
                      val !== null ? `${val} / 5.0` : 'Data belum tersedia',
                      ASPEK_LIST.find((a) => a.id === selectedChartAspectId)?.nama || 'Skor'
                    ]}
                    contentStyle={{ backgroundColor: '#0B1528', color: '#fff', borderRadius: '12px', fontSize: '12px', border: 'none' }}
                  />
                  <ReferenceLine
                    y={3.5}
                    stroke="#f59e0b"
                    strokeDasharray="4 4"
                    label={{ value: 'KKM 3.5', position: 'insideTopLeft', fill: '#d97706', fontSize: 10, fontWeight: 'bold' }}
                  />
                  <Line
                    type="monotone"
                    dataKey={selectedChartAspectId === 'islamicLiteracy' ? 'islamic_literacy' : selectedChartAspectId}
                    name={ASPEK_LIST.find((a) => a.id === selectedChartAspectId)?.nama}
                    stroke={ASPECT_LINE_COLORS[selectedChartAspectId] || '#1E5BF9'}
                    strokeWidth={3.5}
                    dot={{ r: 6, stroke: '#ffffff', strokeWidth: 2 }}
                    activeDot={{ r: 8, stroke: '#ffffff', strokeWidth: 2 }}
                    connectNulls={false}
                  />
                </LineChart>
              ) : (
                <LineChart
                  data={allQuarters.chartData}
                  margin={{ top: 15, right: 20, left: -20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="label" stroke="#64748b" tick={{ fontSize: 11, fontWeight: 'bold' }} />
                  <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} stroke="#64748b" tick={{ fontSize: 11 }} />
                  <RechartsTooltip
                    formatter={(val: any, name: any) => [val !== null ? `${val} / 5.0` : 'Belum tersedia', name]}
                    contentStyle={{ backgroundColor: '#0B1528', color: '#fff', borderRadius: '12px', fontSize: '11px', border: 'none' }}
                  />
                  <RechartsLegend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Line type="monotone" dataKey="kognitif" name="Kognitif" stroke="#eab308" strokeWidth={2} dot={{ r: 4 }} connectNulls={false} />
                  <Line type="monotone" dataKey="afektif" name="Afektif" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} connectNulls={false} />
                  <Line type="monotone" dataKey="psikomotor" name="Psikomotor" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} connectNulls={false} />
                  <Line type="monotone" dataKey="sosial" name="Sosial" stroke="#64748b" strokeWidth={2} dot={{ r: 4 }} connectNulls={false} />
                  <Line type="monotone" dataKey="islamic_literacy" name="Islamic Lit." stroke="#a855f7" strokeWidth={2} dot={{ r: 4 }} connectNulls={false} />
                  <Line type="monotone" dataKey="bilingual" name="Bilingual" stroke="#06b6d4" strokeWidth={2} dot={{ r: 4 }} connectNulls={false} />
                  <Line type="monotone" dataKey="talents" name="Talents" stroke="#0284c7" strokeWidth={2} dot={{ r: 4 }} connectNulls={false} />
                  <Line type="monotone" dataKey="experience" name="Experience" stroke="#f97316" strokeWidth={2} dot={{ r: 4 }} connectNulls={false} />
                  <Line type="monotone" dataKey="inklusivitas" name="Inklusivitas" stroke="#84cc16" strokeWidth={2} dot={{ r: 4 }} connectNulls={false} />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 6. TABEL KOMPARASI 2 TRIWULAN */}
      {comparisonMode === 'two_quarters' ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
            <div>
              <h3 className="font-black text-sm sm:text-base text-slate-900 uppercase">
                TABEL PERBANDINGAN NILAI LENGKAP SAMPAI LEVEL INDIKATOR
              </h3>
              <p className="text-xs text-slate-500">
                Membandingkan nilai numerik aktual {comparison.periodeA.label} vs {comparison.periodeB.label}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={expandAllAspects}
                className="px-3 py-1.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl cursor-pointer transition"
              >
                + Buka Semua Indikator
              </button>
              <button
                onClick={collapseAllAspects}
                className="px-3 py-1.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl cursor-pointer transition"
              >
                - Tutup Semua Indikator
              </button>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-2xl shadow-sm">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-700 text-center font-bold border-b border-slate-200 uppercase text-[11px] tracking-wider">
                  <th className="p-3 border-r border-slate-200 w-12">NO</th>
                  <th className="p-3 border-r border-slate-200 min-w-[200px] text-left">DIMENSI / INDIKATOR</th>
                  <th className="p-3 border-r border-slate-200 w-32 bg-amber-50/70 text-amber-900">
                    {comparison.periodeA.label}
                  </th>
                  <th className="p-3 border-r border-slate-200 w-32 bg-blue-50/70 text-blue-900">
                    {comparison.periodeB.label}
                  </th>
                  <th className="p-3 border-r border-slate-200 w-28">PERUBAHAN</th>
                  <th className="p-3 border-r border-slate-200 w-28">STATUS</th>
                  <th className="p-3 w-24">DETAIL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {comparison.aspects.map((asp) => {
                  const isExpanded = expandedAspects[asp.id] ?? false;

                  return (
                    <React.Fragment key={asp.id}>
                      {/* BARIS UTAMA DIMENSI ASPEK */}
                      <tr className="bg-white font-bold hover:bg-blue-50/30 transition">
                        <td className="p-3 text-center border-r border-slate-100 text-slate-400 font-mono">{asp.no}</td>
                        <td className="p-3 border-r border-slate-100 font-black text-slate-900 uppercase">
                          <div className="flex items-center justify-between">
                            <span>{asp.nama}</span>
                            <span className="text-[10px] text-slate-400 font-semibold lowercase">
                              ({asp.kategori})
                            </span>
                          </div>
                        </td>
                        <td className="p-3 text-center border-r border-slate-100 font-mono font-bold bg-amber-50/20">
                          {asp.hasDataA ? `${asp.scoreA} (${asp.gradeA})` : <span className="text-slate-400">Belum ada</span>}
                        </td>
                        <td className="p-3 text-center border-r border-slate-100 font-mono font-bold bg-blue-50/20">
                          {asp.hasDataB ? `${asp.scoreB} (${asp.gradeB})` : <span className="text-slate-400">Belum ada</span>}
                        </td>
                        <td className="p-3 text-center border-r border-slate-100 font-mono font-black">
                          <span className={asp.status === 'NAIK' ? 'text-emerald-700' : asp.status === 'TURUN' ? 'text-rose-700' : 'text-slate-700'}>
                            {asp.selisih >= 0 ? `+${asp.selisih}` : asp.selisih}
                          </span>
                        </td>
                        <td className="p-3 text-center border-r border-slate-100">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase ${
                              asp.status === 'NAIK'
                                ? 'bg-emerald-100 text-emerald-800'
                                : asp.status === 'TURUN'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            <span>{asp.statusSymbol}</span>
                            <span>{asp.status}</span>
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => toggleAspect(asp.id)}
                            className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 w-full cursor-pointer transition shadow-2xs"
                          >
                            <span>{isExpanded ? 'Tutup' : 'Rincian'}</span>
                            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          </button>
                        </td>
                      </tr>

                      {/* BARIS SUB-INDIKATOR */}
                      {isExpanded &&
                        asp.indicators.map((ind) => (
                          <tr key={ind.key} className="bg-slate-50/60 hover:bg-slate-100/60 text-[11px]">
                            <td className="p-2 text-center text-slate-300 border-r border-slate-100">
                              •
                            </td>
                            <td className="p-2 pl-6 border-r border-slate-100">
                              <div className="font-bold text-slate-800 flex items-center gap-1.5">
                                <span className="w-4 h-4 rounded bg-white text-slate-600 flex items-center justify-center text-[9px] font-bold border border-slate-200">
                                  {ind.kode}
                                </span>
                                <span>{ind.nama}</span>
                              </div>
                              <p className="text-[10px] text-slate-500 pl-5.5">{ind.deskripsi}</p>
                            </td>
                            <td className="p-2 text-center border-r border-slate-100 font-mono">
                              <span className="font-bold text-slate-700">{ind.ratingA}</span>{' '}
                              <span className="text-[10px] text-slate-400">({ind.scoreA}.0)</span>
                            </td>
                            <td className="p-2 text-center border-r border-slate-100 font-mono">
                              <span className="font-bold text-slate-700">{ind.ratingB}</span>{' '}
                              <span className="text-[10px] text-slate-400">({ind.scoreB}.0)</span>
                            </td>
                            <td className="p-2 text-center border-r border-slate-100 font-mono font-bold">
                              <span className={ind.status === 'NAIK' ? 'text-emerald-700' : ind.status === 'TURUN' ? 'text-rose-700' : 'text-slate-600'}>
                                {ind.selisih >= 0 ? `+${ind.selisih}` : ind.selisih}
                              </span>
                            </td>
                            <td className="p-2 text-center border-r border-slate-100">
                              <span
                                className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  ind.status === 'NAIK'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : ind.status === 'TURUN'
                                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                                }`}
                              >
                                <span>{ind.statusSymbol}</span>
                                <span>{ind.status}</span>
                              </span>
                            </td>
                            <td className="p-2 text-center text-slate-300 text-[10px]">
                              -
                            </td>
                          </tr>
                        ))}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* 7. TABEL KOMPARASI SEMUA TRIWULAN (T1 -> T2 -> T3 -> T4) */
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <h3 className="font-black text-sm sm:text-base text-slate-900 uppercase">
                REKAPITULASI PERKEMBANGAN SEPANJANG TAHUN (T1 → T2 → T3 → T4)
              </h3>
              <p className="text-xs text-slate-500">
                Melihat alur progres dan tren nilai siswa secara komprehensif dari awal hingga akhir tahun
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 bg-blue-50 text-[#1E5BF9] rounded-full border border-blue-200">
              4 Periode Triwulan
            </span>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-2xl shadow-sm">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-700 text-center font-bold border-b border-slate-200 uppercase text-[11px] tracking-wider">
                  <th className="p-3 border-r border-slate-200 w-12">NO</th>
                  <th className="p-3 border-r border-slate-200 min-w-[200px] text-left">DIMENSI ASPEK</th>
                  <th className="p-3 border-r border-slate-200 w-28 bg-amber-50/70 text-amber-900">TRIWULAN 1</th>
                  <th className="p-3 border-r border-slate-200 w-28 bg-emerald-50/70 text-emerald-900">TRIWULAN 2</th>
                  <th className="p-3 border-r border-slate-200 w-28 bg-blue-50/70 text-blue-900">TRIWULAN 3</th>
                  <th className="p-3 border-r border-slate-200 w-28 bg-purple-50/70 text-purple-900">TRIWULAN 4</th>
                  <th className="p-3 border-r border-slate-200 w-32">TREN TOTAL</th>
                  <th className="p-3 w-32">STATUS AKHIR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allQuarters.aspects.map((asp) => (
                  <tr key={asp.id} className="hover:bg-blue-50/30 transition">
                    <td className="p-3 text-center font-bold border-r border-slate-100 text-slate-400 font-mono">{asp.no}</td>
                    <td className="p-3 font-black text-slate-900 uppercase border-r border-slate-100">
                      {asp.nama}
                    </td>
                    <td className="p-3 text-center border-r border-slate-100 font-mono font-bold bg-amber-50/20">
                      {asp.t1 !== null ? `${asp.t1}` : <span className="text-slate-400">Belum ada</span>}
                    </td>
                    <td className="p-3 text-center border-r border-slate-100 font-mono font-bold bg-emerald-50/20">
                      {asp.t2 !== null ? `${asp.t2}` : <span className="text-slate-400">Belum ada</span>}
                    </td>
                    <td className="p-3 text-center border-r border-slate-100 font-mono font-bold bg-blue-50/20">
                      {asp.t3 !== null ? `${asp.t3}` : <span className="text-slate-400">Belum ada</span>}
                    </td>
                    <td className="p-3 text-center border-r border-slate-100 font-mono font-bold bg-purple-50/20">
                      {asp.t4 !== null ? `${asp.t4}` : <span className="text-slate-400">Belum ada</span>}
                    </td>
                    <td className="p-3 text-center border-r border-slate-100 font-mono font-black">
                      <span className={asp.selisihTotal > 0 ? 'text-emerald-700' : asp.selisihTotal < 0 ? 'text-rose-700' : 'text-slate-700'}>
                        {asp.selisihTotal >= 0 ? `+${asp.selisihTotal}` : asp.selisihTotal}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold uppercase ${
                          asp.statusAkhir === 'NAIK'
                            ? 'bg-emerald-100 text-emerald-800'
                            : asp.statusAkhir === 'TURUN'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        <span>{asp.statusAkhir === 'NAIK' ? '↑' : asp.statusAkhir === 'TURUN' ? '↓' : '→'}</span>
                        <span>{asp.statusAkhir}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
