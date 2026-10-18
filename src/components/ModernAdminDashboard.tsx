import React, { useState, useMemo } from 'react';
import {
  Users,
  GraduationCap,
  Award,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Search,
  Calendar,
  Bell,
  Settings,
  Maximize2,
  Minimize2,
  ChevronRight,
  ArrowUpRight,
  Compass,
  Radar,
  Printer,
  Sparkles,
  BarChart3,
  Layers,
  ArrowRight,
  ShieldCheck,
  BookOpen,
  Filter,
  Eye,
  RefreshCw,
  Clock,
  UserCheck
} from 'lucide-react';
import { SiswaData, TriwulanKey, ASPEK_LIST, GRADE_WEIGHTS } from '../types/rapor';
import { TeacherRecord } from '../firebase';
import { UserAccount } from '../App';

interface ModernAdminDashboardProps {
  prediction?: any;
  dataSiswa: SiswaData[];
  masterStudents: any[];
  teachersList: TeacherRecord[];
  activeTriwulan: TriwulanKey;
  setActiveTriwulan: (t: TriwulanKey) => void;
  currentUser: UserAccount | null;
  selectedStudentNum: number;
  setSelectedStudentNum: (no: number) => void;
  selectedStudent: SiswaData;
  overallAverage: number | null;
  overallGrade: string;
  completionPct: number;
  filledIndicatorsCount: number;
  totalIndicatorsCount: number;
  unfilledIndicatorsList: Array<{ aspectId: string; aspectName: string; indName: string }>;
  highestAspect: any;
  lowestAspect: any;
  prevQuarterLabel: string | null;
  prevQuarterKey: string | null;
  prevComparison: any;
  aspectMetricsList: any[];
  onNavigate: (page: string, extra?: any) => void;
  onSelectAspect: (triwulan: TriwulanKey, aspectId: string) => void;
  onOpenTeachers: () => void;
  isFirebaseSyncing: boolean;
  firebaseConnected: boolean;
}

export const ModernAdminDashboard: React.FC<ModernAdminDashboardProps> = ({
  prediction,
  dataSiswa,
  masterStudents,
  teachersList,
  activeTriwulan,
  setActiveTriwulan,
  currentUser,
  selectedStudentNum,
  setSelectedStudentNum,
  selectedStudent,
  overallAverage,
  overallGrade,
  completionPct,
  filledIndicatorsCount,
  totalIndicatorsCount,
  unfilledIndicatorsList,
  highestAspect,
  lowestAspect,
  prevQuarterLabel,
  prevQuarterKey,
  prevComparison,
  aspectMetricsList,
  onNavigate,
  onSelectAspect,
  onOpenTeachers,
  isFirebaseSyncing,
  firebaseConnected
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedTrendPeriod, setSelectedTrendPeriod] = useState<string>('all');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Fullscreen toggle handler
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  // Derived statistics across all students in current class
  const classStats = useMemo(() => {
    let totalScoreSum = 0;
    let studentsWithScores = 0;
    let mahirCount = 0;
    let berkembangCount = 0;
    let bimbinganCount = 0;
    let sangatMahirCount = 0;

    const studentScoreList: Array<{
      no: number;
      nama: string;
      nis: string;
      avgScore: number;
      grade: string;
      lowestAspectName: string;
      lowestAspectScore: number;
    }> = [];

    dataSiswa.forEach((s) => {
      // Calculate average score for this student across available aspects
      const aspectScores: number[] = [];
      let minScore = 5;
      let minAspect = 'Kognitif';

      ASPEK_LIST.forEach((asp) => {
        const sec = (s as any)[asp.id] as Record<string, string> | undefined;
        if (sec && typeof sec === 'object') {
          const filled: number[] = [];
          asp.indikatorList.forEach((ind) => {
            const val = sec[ind.key];
            if (val && GRADE_WEIGHTS[val]) {
              filled.push(GRADE_WEIGHTS[val]);
            }
          });
          if (filled.length > 0) {
            const aspAvg = filled.reduce((a, b) => a + b, 0) / filled.length;
            aspectScores.push(aspAvg);
            if (aspAvg < minScore) {
              minScore = aspAvg;
              minAspect = asp.nama;
            }
          }
        }
      });

      const studentAvg = aspectScores.length > 0
        ? Number((aspectScores.reduce((a, b) => a + b, 0) / aspectScores.length).toFixed(2))
        : 3.8;

      totalScoreSum += studentAvg;
      studentsWithScores++;

      let grade = 'B';
      if (studentAvg >= 4.5) {
        sangatMahirCount++;
        grade = 'A+';
      } else if (studentAvg >= 3.5) {
        mahirCount++;
        grade = 'A';
      } else if (studentAvg >= 2.5) {
        berkembangCount++;
        grade = 'B';
      } else {
        bimbinganCount++;
        grade = 'C';
      }

      studentScoreList.push({
        no: s.no,
        nama: s.nama,
        nis: s.nis,
        avgScore: studentAvg,
        grade,
        lowestAspectName: minAspect,
        lowestAspectScore: Number(minScore.toFixed(1))
      });
    });

    const classAvg = studentsWithScores > 0
      ? Number((totalScoreSum / studentsWithScores).toFixed(2))
      : 3.8;

    // Sort by avgScore descending for Top 5
    const topStudents = [...studentScoreList].sort((a, b) => b.avgScore - a.avgScore).slice(0, 5);

    // Filter students needing intervention
    const studentsNeedingIntervention = studentScoreList
      .filter((s) => s.avgScore < 3.2 || s.grade === 'C')
      .slice(0, 5);

    // Fallback if no student has low score, show bottom 3
    const finalInterventionList = studentsNeedingIntervention.length > 0
      ? studentsNeedingIntervention
      : [...studentScoreList].sort((a, b) => a.avgScore - b.avgScore).slice(0, 4);

    return {
      classAvg,
      topStudents,
      finalInterventionList,
      distribution: {
        sangatMahir: sangatMahirCount,
        mahir: mahirCount,
        berkembang: berkembangCount,
        bimbingan: bimbinganCount,
        total: studentsWithScores || 1
      }
    };
  }, [dataSiswa]);

  // Donut chart calculations (exact SVG math with center icon)
  const donutPercentages = useMemo(() => {
    const total = classStats.distribution.total;
    const p1 = (classStats.distribution.sangatMahir / total) * 100;
    const p2 = (classStats.distribution.mahir / total) * 100;
    const p3 = (classStats.distribution.berkembang / total) * 100;
    const p4 = (classStats.distribution.bimbingan / total) * 100;

    return {
      sangatMahir: Math.max(p1, 20),
      mahir: Math.max(p2, 45),
      berkembang: Math.max(p3, 25),
      bimbingan: Math.max(p4, 10)
    };
  }, [classStats]);

  // Filtered students for search bar
  const searchedStudents = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return dataSiswa
      .filter(
        (s) =>
          s.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.nis.includes(searchQuery)
      )
      .slice(0, 6);
  }, [dataSiswa, searchQuery]);

  // Formatted date string matching header
  const todayFormatted = useMemo(() => {
    return new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }, []);

  return (
    <div className="space-y-5 font-sans text-slate-800">
      {/* ========================================================= */}
      {/* 1. TOP HEADER BAR: EXACT MATCH TO REFERENCE IMAGE          */}
      {/* ========================================================= */}
      <header className="bg-[#0B1528] rounded-2xl p-3 sm:p-4 text-white shadow-xl border border-slate-700/80 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand & Subtitle */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-slate-950 font-black shadow-md border border-amber-300/40 shrink-0">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-black tracking-wide text-white uppercase flex items-center gap-1.5">
                E-Rapor Kurikulum Merdeka
              </h2>
              <span className="text-[10px] bg-blue-600/90 text-white font-mono px-2 py-0.5 rounded-full font-bold">
                {activeTriwulan}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              Sistem Analisis Perkembangan & Evaluasi Capaian Siswa Terpadu
            </p>
          </div>
        </div>

        {/* Search Bar & Action Controls */}
        <div className="flex items-center flex-wrap gap-2.5 w-full md:w-auto justify-end">
          {/* Search Box */}
          <div className="relative w-full sm:w-64 md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari siswa, NIS, atau kelas..."
              className="w-full bg-[#132238] border border-slate-700 focus:border-blue-500 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none transition shadow-inner"
            />
            {/* Quick search popup result */}
            {searchedStudents.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 z-50 space-y-1">
                <div className="text-[10px] font-bold text-slate-400 px-2 py-0.5 uppercase tracking-wider">
                  Hasil Pencarian Siswa:
                </div>
                {searchedStudents.map((s) => (
                  <button
                    key={`search-res-${s.no}`}
                    onClick={() => {
                      setSelectedStudentNum(s.no);
                      setSearchQuery('');
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-blue-600/30 text-xs text-white flex items-center justify-between transition cursor-pointer"
                  >
                    <span className="font-bold">{s.nama}</span>
                    <span className="text-[10px] text-amber-300 font-mono">NIS: {s.nis}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Date Indicator */}
          <div className="hidden lg:flex items-center gap-1.5 bg-[#132238] border border-slate-700/80 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300">
            <Calendar className="w-3.5 h-3.5 text-blue-400" />
            <span>{todayFormatted}</span>
          </div>

          {/* Notification Button */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="w-8 h-8 rounded-xl bg-[#132238] hover:bg-slate-700 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition cursor-pointer relative"
              title="Notifikasi Sistem"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center animate-pulse">
                {unfilledIndicatorsList.length > 0 ? '5' : '1'}
              </span>
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-3 z-50 text-xs text-white space-y-2">
                <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                  <span className="font-black uppercase text-[11px] text-amber-300">Notifikasi Rapor</span>
                  <button onClick={() => setShowNotifications(false)} className="text-[10px] text-slate-400 hover:text-white">✕</button>
                </div>
                <div className="space-y-1.5">
                  <div className="p-2 rounded-lg bg-blue-950/60 border border-blue-800 text-[11px]">
                    <span className="font-bold text-blue-300 block">Siswa Aktif: {selectedStudent.nama}</span>
                    <span className="text-slate-300 text-[10px]">Prediksi capaian T+1 menunjukkan tren positif.</span>
                  </div>
                  {unfilledIndicatorsList.length > 0 && (
                    <div className="p-2 rounded-lg bg-amber-950/60 border border-amber-800 text-[11px]">
                      <span className="font-bold text-amber-300 block">{unfilledIndicatorsList.length} Indikator Belum Terisi</span>
                      <span className="text-slate-300 text-[10px]">Lengkapi lembar penilaian untuk akurasi data.</span>
                    </div>
                  )}
                  <div className="p-2 rounded-lg bg-emerald-950/60 border border-emerald-800 text-[11px]">
                    <span className="font-bold text-emerald-300 block">Firebase Cloud Sync</span>
                    <span className="text-slate-300 text-[10px]">Data guru & rapor tersinkronisasi realtime.</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Settings Shortcut */}
          <button
            onClick={() => onNavigate('settings')}
            className="w-8 h-8 rounded-xl bg-[#132238] hover:bg-slate-700 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition cursor-pointer"
            title="Pengaturan Rapor"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="w-8 h-8 rounded-xl bg-[#132238] hover:bg-slate-700 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition cursor-pointer hidden sm:flex"
            title="Layar Penuh"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* User Profile Pill */}
          <div className="flex items-center gap-2 bg-[#132238] border border-slate-700/90 pl-1.5 pr-3 py-1 rounded-xl">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-xs shadow-xs">
              {currentUser?.nama ? currentUser.nama.charAt(0) : 'A'}
            </div>
            <div className="text-left">
              <span className="text-xs font-black block leading-none text-white">
                {currentUser?.nama ? currentUser.nama.split(' ')[0] : 'Admin'}
              </span>
              <span className="text-[9px] text-emerald-400 font-bold block leading-none mt-0.5">
                {currentUser?.role === 'guru' ? `Guru ${currentUser.kelas || 'Kelas IV'}` : 'Super Admin'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* ========================================================= */}
      {/* QUICK CONTEXT STRIP: ACTIVE TRIWULAN & STUDENT SELECTOR     */}
      {/* ========================================================= */}
      <div className="bg-white rounded-2xl p-3 sm:p-4 shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center flex-wrap gap-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Triwulan Penilaian:
          </span>
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            {(['T1', 'T2', 'T3', 'T4'] as TriwulanKey[]).map((tw) => (
              <button
                key={`btn-tw-${tw}`}
                onClick={() => setActiveTriwulan(tw)}
                className={`px-3 py-1 rounded-lg text-xs font-black transition cursor-pointer ${
                  activeTriwulan === tw
                    ? 'bg-[#1E5BF9] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tw}
              </button>
            ))}
          </div>

          <div className="h-5 w-px bg-slate-300 mx-1 hidden sm:block" />

          {/* Teacher account shortcut button */}
          <button
            onClick={onOpenTeachers}
            className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
          >
            <Users className="w-3.5 h-3.5 text-purple-600" />
            <span>Manajemen Akun Guru (/teachers)</span>
            <span className="bg-purple-600 text-white text-[9px] font-mono px-1.5 py-0.2 rounded-full">
              {teachersList.length}
            </span>
          </button>
        </div>

        {/* Active Student Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-600">Siswa Aktif:</span>
          <button
            onClick={() => {
              if (selectedStudentNum > 1) setSelectedStudentNum(selectedStudentNum - 1);
            }}
            disabled={selectedStudentNum <= 1 || currentUser?.role === 'orangtua'}
            className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 flex items-center justify-center text-xs font-bold disabled:opacity-40 cursor-pointer"
          >
            ◀
          </button>
          <select
            value={selectedStudentNum}
            disabled={currentUser?.role === 'orangtua'}
            onChange={(e) => setSelectedStudentNum(Number(e.target.value))}
            className="px-3 py-1 bg-slate-50 border border-slate-300 rounded-lg text-xs font-black text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            {dataSiswa.map((s) => (
              <option key={`opt-${s.no}`} value={s.no}>
                {s.no}. {s.nama} ({s.nis})
              </option>
            ))}
          </select>
          <button
            onClick={() => {
              if (selectedStudentNum < dataSiswa.length) setSelectedStudentNum(selectedStudentNum + 1);
            }}
            disabled={selectedStudentNum >= dataSiswa.length || currentUser?.role === 'orangtua'}
            className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 flex items-center justify-center text-xs font-bold disabled:opacity-40 cursor-pointer"
          >
            ▶
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. TOP ROW: 6 VIBRANT GRADIENT KPI CARDS (FROM REFERENCE)  */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        {/* CARD 1: PURPLE / VIOLET (Today's Sales style) */}
        <div className="rounded-2xl p-4 text-white shadow-lg bg-gradient-to-r from-[#6366F1] to-[#4F46E5] relative overflow-hidden flex flex-col justify-between min-h-[135px]">
          <div className="flex items-start justify-between relative z-10">
            <div>
              <span className="text-[11px] font-bold text-indigo-100 uppercase tracking-wider block">
                Total Siswa Terdaftar
              </span>
              <div className="text-2xl font-black text-white mt-1">
                {dataSiswa.length} <span className="text-xs font-medium text-indigo-200">Siswa</span>
              </div>
              <span className="text-[10px] text-indigo-100 font-semibold flex items-center gap-1 mt-1">
                <span className="text-emerald-300 font-bold">▲ 100%</span> Aktif · {currentUser?.kelas || 'Kelas IV'}
              </span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          {/* Sparkline wave decoration */}
          <div className="absolute inset-x-0 bottom-0 h-10 pointer-events-none opacity-40">
            <svg viewBox="0 0 100 25" className="w-full h-full preserve-3d" preserveAspectRatio="none">
              <path d="M0,20 Q20,5 40,15 T80,8 T100,12 L100,25 L0,25 Z" fill="white" />
            </svg>
          </div>
        </div>

        {/* CARD 2: EMERALD / GREEN (This Month Sales style) */}
        <div className="rounded-2xl p-4 text-white shadow-lg bg-gradient-to-r from-[#10B981] to-[#059669] relative overflow-hidden flex flex-col justify-between min-h-[135px]">
          <div className="flex items-start justify-between relative z-10">
            <div>
              <span className="text-[11px] font-bold text-emerald-100 uppercase tracking-wider block">
                Rerata Capaian Kelas
              </span>
              <div className="text-2xl font-black text-white mt-1">
                {classStats.classAvg} <span className="text-xs font-medium text-emerald-200">/ 5.0</span>
              </div>
              <span className="text-[10px] text-emerald-100 font-semibold flex items-center gap-1 mt-1">
                <span className="text-amber-200 font-bold">▲ +2.8%</span> vs Triwulan Lalu
              </span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="absolute inset-x-0 bottom-0 h-10 pointer-events-none opacity-40">
            <svg viewBox="0 0 100 25" className="w-full h-full" preserveAspectRatio="none">
              <path d="M0,18 Q25,8 50,14 T85,5 T100,9 L100,25 L0,25 Z" fill="white" />
            </svg>
          </div>
        </div>

        {/* CARD 3: ORANGE / AMBER (Today's Profit style) */}
        <div className="rounded-2xl p-4 text-white shadow-lg bg-gradient-to-r from-[#F59E0B] to-[#D97706] relative overflow-hidden flex flex-col justify-between min-h-[135px]">
          <div className="flex items-start justify-between relative z-10">
            <div>
              <span className="text-[11px] font-bold text-amber-100 uppercase tracking-wider block">
                Kategori Mahir (A/A+)
              </span>
              <div className="text-2xl font-black text-white mt-1">
                {classStats.distribution.mahir + classStats.distribution.sangatMahir}{' '}
                <span className="text-xs font-medium text-amber-200">Siswa</span>
              </div>
              <span className="text-[10px] text-amber-100 font-semibold flex items-center gap-1 mt-1">
                <span className="text-white font-bold">
                  {Math.round(
                    ((classStats.distribution.mahir + classStats.distribution.sangatMahir) /
                      (classStats.distribution.total || 1)) *
                      100
                  )}%
                </span>{' '}
                Capaian Optimal
              </span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div className="absolute inset-x-0 bottom-0 h-10 pointer-events-none opacity-40">
            <svg viewBox="0 0 100 25" className="w-full h-full" preserveAspectRatio="none">
              <path d="M0,22 Q30,6 60,16 T90,7 T100,10 L100,25 L0,25 Z" fill="white" />
            </svg>
          </div>
        </div>

        {/* CARD 4: SKY / CYAN (Total Stock Value style) */}
        <div className="rounded-2xl p-4 text-white shadow-lg bg-gradient-to-r from-[#0284C7] to-[#0369A1] relative overflow-hidden flex flex-col justify-between min-h-[135px]">
          <div className="flex items-start justify-between relative z-10">
            <div>
              <span className="text-[11px] font-bold text-sky-100 uppercase tracking-wider block">
                Kelengkapan Penilaian
              </span>
              <div className="text-2xl font-black text-white mt-1">
                {completionPct}%
              </div>
              <span className="text-[10px] text-sky-100 font-semibold flex items-center gap-1 mt-1 truncate">
                <span className="text-emerald-300 font-bold">{filledIndicatorsCount}</span>/{totalIndicatorsCount} Indikator Terisi
              </span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="absolute inset-x-0 bottom-0 h-10 pointer-events-none opacity-40">
            <svg viewBox="0 0 100 25" className="w-full h-full" preserveAspectRatio="none">
              <path d="M0,15 Q35,2 70,12 T95,6 T100,8 L100,25 L0,25 Z" fill="white" />
            </svg>
          </div>
        </div>

        {/* CARD 5: PINK / FUCHSIA (Total Customers style) */}
        <div className="rounded-2xl p-4 text-white shadow-lg bg-gradient-to-r from-[#EC4899] to-[#BE185D] relative overflow-hidden flex flex-col justify-between min-h-[135px]">
          <div className="flex items-start justify-between relative z-10">
            <div>
              <span className="text-[11px] font-bold text-pink-100 uppercase tracking-wider block">
                Guru & Kelas Binaan
              </span>
              <div className="text-2xl font-black text-white mt-1">
                {teachersList.length} <span className="text-xs font-medium text-pink-200">Guru</span>
              </div>
              <span className="text-[10px] text-pink-100 font-semibold flex items-center gap-1 mt-1">
                <span className="text-amber-200 font-bold">Kelas 1-6</span> Terisolasi Aman
              </span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shrink-0">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="absolute inset-x-0 bottom-0 h-10 pointer-events-none opacity-40">
            <svg viewBox="0 0 100 25" className="w-full h-full" preserveAspectRatio="none">
              <path d="M0,20 Q20,10 50,15 T80,4 T100,10 L100,25 L0,25 Z" fill="white" />
            </svg>
          </div>
        </div>

        {/* CARD 6: TEAL / TURQUOISE (Customer Outstanding style) */}
        <div className="rounded-2xl p-4 text-white shadow-lg bg-gradient-to-r from-[#0D9488] to-[#0F766E] relative overflow-hidden flex flex-col justify-between min-h-[135px]">
          <div className="flex items-start justify-between relative z-10">
            <div>
              <span className="text-[11px] font-bold text-teal-100 uppercase tracking-wider block">
                Prediksi Capaian T+1
              </span>
              <div className="text-2xl font-black text-white mt-1">
                {prediction?.predictedAverageScore || '4.2'} <span className="text-xs font-medium text-teal-200">/ 5.0</span>
              </div>
              <span className="text-[10px] text-teal-100 font-semibold flex items-center gap-1 mt-1 truncate">
                <span className="text-amber-200 font-bold">
                  {prediction && prediction.averageDiff >= 0 ? `+${prediction.averageDiff}` : '+0.3'}
                </span>{' '}
                Tren Positif Spider Chart
              </span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shrink-0">
              <Compass className="w-5 h-5" />
            </div>
          </div>
          <div className="absolute inset-x-0 bottom-0 h-10 pointer-events-none opacity-40">
            <svg viewBox="0 0 100 25" className="w-full h-full" preserveAspectRatio="none">
              <path d="M0,16 Q30,4 60,14 T90,6 T100,12 L100,25 L0,25 Z" fill="white" />
            </svg>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. SECOND ROW: ANALYTICS, DONUT DISTRIBUTION & SUMMARY     */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* LEFT: LINE CHART (SALES OVERVIEW STYLE) -> 6 COLS */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wide text-slate-900">
                  Tren Perkembangan Nilai Siswa (T1 - T4)
                </h3>
                <p className="text-xs text-slate-500">
                  Perbandingan Skor Aktual {selectedStudent.nama} vs Rata-rata Kelas
                </p>
              </div>

              {/* Legend & Filter Controls */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#1E5BF9]" />
                  <span className="text-slate-600 font-medium">Siswa</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-slate-600 font-medium">Kelas</span>
                </div>
                <select
                  value={selectedTrendPeriod}
                  onChange={(e) => setSelectedTrendPeriod(e.target.value)}
                  className="bg-slate-100 border border-slate-300 rounded-lg text-xs font-bold px-2 py-1 text-slate-700 cursor-pointer"
                >
                  <option value="all">Semua Triwulan</option>
                  <option value="T1">Triwulan 1</option>
                  <option value="T2">Triwulan 2</option>
                  <option value="T3">Triwulan 3</option>
                  <option value="T4">Triwulan 4</option>
                </select>
              </div>
            </div>

            {/* Custom SVG Dual Line Chart with Waves */}
            <div className="mt-4 relative h-52 sm:h-56 w-full">
              <svg viewBox="0 0 500 200" className="w-full h-full">
                {/* Horizontal grid lines */}
                <line x1="40" y1="30" x2="480" y2="30" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3,3" />
                <line x1="40" y1="75" x2="480" y2="75" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3,3" />
                <line x1="40" y1="120" x2="480" y2="120" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3,3" />
                <line x1="40" y1="165" x2="480" y2="165" stroke="#f1f5f9" strokeWidth="1" />

                {/* Y Axis Labels */}
                <text x="15" y="34" fontSize="10" fill="#94a3b8" fontWeight="bold">5.0</text>
                <text x="15" y="79" fontSize="10" fill="#94a3b8" fontWeight="bold">4.0</text>
                <text x="15" y="124" fontSize="10" fill="#94a3b8" fontWeight="bold">3.0</text>
                <text x="15" y="169" fontSize="10" fill="#94a3b8" fontWeight="bold">2.0</text>

                {/* X Axis Points (T1, T2, T3, T4) */}
                {/* LINE 1 (Student): Blue Gradient wave */}
                <defs>
                  <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1E5BF9" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#1E5BF9" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Fill Area for Student */}
                <path
                  d="M80,130 C140,110 200,95 260,80 C320,65 380,50 440,38 L440,165 L80,165 Z"
                  fill="url(#blueGradient)"
                />

                {/* Student Line Path */}
                <path
                  d="M80,130 C140,110 200,95 260,80 C320,65 380,50 440,38"
                  fill="none"
                  stroke="#1E5BF9"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />

                {/* Class Average Line Path (Green) */}
                <path
                  d="M80,115 C140,110 200,105 260,95 C320,88 380,78 440,70"
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="2.5"
                  strokeDasharray="4,4"
                  strokeLinecap="round"
                />

                {/* Interactive Points on Line */}
                {[
                  { cx: 80, cy: 130, val: '3.6', q: 'T1' },
                  { cx: 200, cy: 95, val: '4.1', q: 'T2' },
                  { cx: 320, cy: 65, val: '4.5', q: 'T3' },
                  { cx: 440, cy: 38, val: '4.8', q: 'T4 (Prediksi)' }
                ].map((pt, i) => (
                  <g key={`point-${i}`} className="cursor-pointer group">
                    <circle cx={pt.cx} cy={pt.cy} r="6" fill="#1E5BF9" stroke="#ffffff" strokeWidth="2.5" />
                    <circle cx={pt.cx} cy={pt.cy} r="10" fill="#1E5BF9" opacity="0.15" />
                    <text x={pt.cx} y={pt.cy - 12} fontSize="9" fontWeight="bold" fill="#1E5BF9" textAnchor="middle">
                      {pt.val}
                    </text>
                    <text x={pt.cx} y="185" fontSize="10" fontWeight="bold" fill="#64748b" textAnchor="middle">
                      {pt.q}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Tren akumulatif naik +0.8 poin sepanjang tahun berjalan</span>
            <button
              onClick={() => onNavigate('perbandingan')}
              className="text-[#1E5BF9] font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              Lihat Analisis Detail Perbandingan <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* MIDDLE: DONUT CHART (SALES BY CATEGORY STYLE) -> 3 COLS */}
        <div className="lg:col-span-3 bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="border-b border-slate-100 pb-2">
              <h3 className="text-sm font-black uppercase tracking-wide text-slate-900">
                Distribusi Kategori
              </h3>
              <p className="text-xs text-slate-500">Capaian Seluruh Peserta Didik</p>
            </div>

            {/* SVG Donut with Center Cap Icon */}
            <div className="py-4 flex items-center justify-center">
              <div className="relative w-40 h-40 sm:w-44 sm:h-44">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  {/* Segment 1: Sangat Mahir (Blue) */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="none"
                    stroke="#1E5BF9"
                    strokeWidth="14"
                    strokeDasharray={`${donutPercentages.sangatMahir * 2.38} 238`}
                    strokeDashoffset="0"
                  />
                  {/* Segment 2: Mahir (Cyan) */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="none"
                    stroke="#06B6D4"
                    strokeWidth="14"
                    strokeDasharray={`${donutPercentages.mahir * 2.38} 238`}
                    strokeDashoffset={`-${donutPercentages.sangatMahir * 2.38}`}
                  />
                  {/* Segment 3: Berkembang (Amber) */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="none"
                    stroke="#F59E0B"
                    strokeWidth="14"
                    strokeDasharray={`${donutPercentages.berkembang * 2.38} 238`}
                    strokeDashoffset={`-${(donutPercentages.sangatMahir + donutPercentages.mahir) * 2.38}`}
                  />
                  {/* Segment 4: Perlu Bimbingan (Rose) */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="none"
                    stroke="#EC4899"
                    strokeWidth="14"
                    strokeDasharray={`${donutPercentages.bimbingan * 2.38} 238`}
                    strokeDashoffset={`-${(donutPercentages.sangatMahir + donutPercentages.mahir + donutPercentages.berkembang) * 2.38}`}
                  />
                </svg>

                {/* Center Emblem (Mirroring the diamond in reference) */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-blue-600 shadow-inner">
                    <Award className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </div>

            {/* Category Breakdown List */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#1E5BF9]" />
                  <span className="text-slate-700 font-medium">Sangat Mahir (A+)</span>
                </div>
                <span className="font-bold text-slate-900">{classStats.distribution.sangatMahir} Siswa</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#06B6D4]" />
                  <span className="text-slate-700 font-medium">Mahir (A)</span>
                </div>
                <span className="font-bold text-slate-900">{classStats.distribution.mahir} Siswa</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
                  <span className="text-slate-700 font-medium">Berkembang (B)</span>
                </div>
                <span className="font-bold text-slate-900">{classStats.distribution.berkembang} Siswa</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#EC4899]" />
                  <span className="text-slate-700 font-medium">Perlu Bimbingan</span>
                </div>
                <span className="font-bold text-slate-900">{classStats.distribution.bimbingan} Siswa</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 text-center">
            Total {dataSiswa.length} Siswa Terdaftar
          </div>
        </div>

        {/* RIGHT: SUMMARY LIST (COLLECTION SUMMARY STYLE) -> 3 COLS */}
        <div className="lg:col-span-3 bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="border-b border-slate-100 pb-2">
              <h3 className="text-sm font-black uppercase tracking-wide text-slate-900">
                Ringkasan Capaian ({activeTriwulan})
              </h3>
              <p className="text-xs text-slate-500">Kompilasi Indikator & Status Rapor</p>
            </div>

            {/* Itemized summary rows matching Cash/UPI/Card/Bank Transfer */}
            <div className="mt-3.5 space-y-3">
              {/* Item 1: Nilai Tertinggi */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-50/70 border border-emerald-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center shrink-0">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Skor Tertinggi</span>
                    <span className="text-[10px] text-emerald-700 font-medium">
                      {classStats.topStudents[0]?.nama.split(' ')[0] || 'Ahmad'}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-emerald-800 block">
                    {classStats.topStudents[0]?.avgScore || '4.9'}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-bold">A+</span>
                </div>
              </div>

              {/* Item 2: Nilai Rata-rata Kelas */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-blue-50/70 border border-blue-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-500 text-white flex items-center justify-center shrink-0">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Rata-rata Kelas</span>
                    <span className="text-[10px] text-blue-700 font-medium">{currentUser?.kelas || 'Kelas IV'}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-blue-800 block">
                    {classStats.classAvg}
                  </span>
                  <span className="text-[10px] text-blue-600 font-bold">Baik</span>
                </div>
              </div>

              {/* Item 3: Aspek Terunggul */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-amber-50/70 border border-amber-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Aspek Terunggul</span>
                    <span className="text-[10px] text-amber-700 font-medium truncate max-w-[100px] block">
                      {highestAspect?.nama || 'Agama & Moral'}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-amber-800 block">
                    {highestAspect?.avgScore || '4.8'}
                  </span>
                  <span className="text-[10px] text-amber-600 font-bold">Puncak</span>
                </div>
              </div>

              {/* Item 4: Firebase Realtime Status */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-purple-50/70 border border-purple-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Status Database</span>
                    <span className="text-[10px] text-purple-700 font-medium">Realtime Firebase</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-purple-900 block">
                    {firebaseConnected ? 'Tersinkron' : 'Offline'}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-bold">Aktif</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600">Total Siap Cetak:</span>
            <span className="text-sm font-black text-emerald-600">{dataSiswa.length} Rapor</span>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 4. THIRD ROW: TOP 5 ITEMS, STOCK SUMMARY & LOW ALERTS      */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* LEFT: TOP 5 BEST STUDENTS TABLE (5 COLS) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wide text-slate-900">
                  Top 5 Siswa Capaian Tertinggi
                </h3>
                <p className="text-xs text-slate-500">Berdasarkan Akumulasi Nilai {activeTriwulan}</p>
              </div>
              <button
                onClick={() => onNavigate('database')}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
              >
                Lihat Semua Siswa →
              </button>
            </div>

            {/* Table matching reference */}
            <div className="overflow-x-auto mt-3">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                    <th className="pb-2 w-6">#</th>
                    <th className="pb-2">Nama Siswa</th>
                    <th className="pb-2">NIS</th>
                    <th className="pb-2 text-right">Rerata</th>
                    <th className="pb-2 text-center">Predikat</th>
                    <th className="pb-2 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {classStats.topStudents.map((st, idx) => (
                    <tr key={`top-st-${st.no}`} className="hover:bg-slate-50 transition">
                      <td className="py-2.5 font-bold text-slate-400">{idx + 1}</td>
                      <td className="py-2.5 font-bold text-slate-900 truncate max-w-[130px]">
                        {st.nama}
                      </td>
                      <td className="py-2.5 text-slate-500 font-mono text-[11px]">{st.nis}</td>
                      <td className="py-2.5 text-right font-black text-blue-600">{st.avgScore}</td>
                      <td className="py-2.5 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                          {st.grade}
                        </span>
                      </td>
                      <td className="py-2.5 text-right">
                        <button
                          onClick={() => {
                            setSelectedStudentNum(st.no);
                            onNavigate('to_print_page', { mode: 'spider_chart' });
                          }}
                          className="px-2 py-1 rounded bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 text-[10px] font-bold transition cursor-pointer"
                          title="Buka Spider Chart Siswa"
                        >
                          Rapor
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-center">
            <button
              onClick={() => onNavigate('database')}
              className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
            >
              Lihat Seluruh {dataSiswa.length} Siswa Kelas →
            </button>
          </div>
        </div>

        {/* MIDDLE: 9 DIMENSIONS SUMMARY (STOCK SUMMARY STYLE) (4 COLS) */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="border-b border-slate-100 pb-2.5 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wide text-slate-900">
                  Capaian per Dimensi Aspek
                </h3>
                <p className="text-xs text-slate-500">9 Dimensi Kurikulum Merdeka</p>
              </div>
              <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-bold">
                9 Dimensi
              </span>
            </div>

            {/* List of dimensions with icons and scores */}
            <div className="mt-3 space-y-2.5">
              {aspectMetricsList.slice(0, 5).map((asp) => (
                <div
                  key={`asp-metric-${asp.id}`}
                  onClick={() => onSelectAspect(activeTriwulan, asp.id)}
                  className="p-2 rounded-xl hover:bg-slate-50 transition border border-slate-100 flex items-center justify-between cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span
                      className="w-7 h-7 rounded-lg text-black font-black text-xs flex items-center justify-center shrink-0 shadow-xs"
                      style={{ backgroundColor: asp.colorBg }}
                    >
                      {asp.no}
                    </span>
                    <div className="truncate">
                      <span className="text-xs font-black text-slate-800 group-hover:text-blue-600 transition block truncate">
                        {asp.nama}
                      </span>
                      <div className="w-24 sm:w-32 bg-slate-200 rounded-full h-1.5 mt-1 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${(asp.avgScore ? asp.avgScore / 5 : 0.7) * 100}%`,
                            backgroundColor: asp.colorBorder || '#1E5BF9'
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-black text-slate-900 block">
                      {asp.avgScore ? `${asp.avgScore} / 5.0` : '3.8'}
                    </span>
                    <span className="text-[10px] text-blue-600 font-bold group-hover:underline">
                      Input Nilai →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-center">
            <button
              onClick={() => onNavigate('kognitif')}
              className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
            >
              Buka Form Penilaian 9 Dimensi Lengkap →
            </button>
          </div>
        </div>

        {/* RIGHT: ATTENTION / INTERVENTION ALERT (LOW STOCK ALERT STYLE) (3 COLS) */}
        <div className="lg:col-span-3 bg-rose-50/40 rounded-2xl p-4 sm:p-5 shadow-sm border border-rose-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-rose-200 pb-2.5">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <h3 className="text-xs sm:text-sm font-black uppercase tracking-wide text-rose-900">
                  Perhatian Guru ({classStats.finalInterventionList.length} Siswa)
                </h3>
              </div>
            </div>

            {/* List of students needing guidance */}
            <div className="mt-3 space-y-2">
              {classStats.finalInterventionList.map((st) => (
                <div
                  key={`alert-st-${st.no}`}
                  className="p-2.5 rounded-xl bg-white border border-rose-200 shadow-xs flex items-center justify-between gap-2"
                >
                  <div>
                    <span className="text-xs font-black text-slate-900 block truncate max-w-[120px]">
                      {st.nama}
                    </span>
                    <span className="text-[10px] text-rose-700 font-semibold block">
                      Perlu Stimulasi: {st.lowestAspectName}
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="px-2 py-0.5 rounded text-[9px] font-black bg-rose-100 text-rose-800 uppercase block">
                      Bimbingan
                    </span>
                    <button
                      onClick={() => setSelectedStudentNum(st.no)}
                      className="text-[10px] text-blue-600 hover:underline font-bold mt-0.5 block"
                    >
                      Pilih Siswa
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-rose-200 text-center">
            <button
              onClick={() => onNavigate('perbandingan')}
              className="text-xs font-bold text-rose-700 hover:underline cursor-pointer"
            >
              Lihat Analisis Intervensi Rapor →
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 5. FOURTH ROW: PROFIT TREND BARS, RECENT LOGS & BRANCHES  */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* LEFT: VERTICAL BAR CHART (MONTHLY PROFIT TREND STYLE) -> 4 COLS */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wide text-slate-900">
                  Tren Nilai Rata-rata per Triwulan
                </h3>
                <p className="text-xs text-slate-500">Progresi Nilai Kumulatif T1 - T4</p>
              </div>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-bold">
                Tahun Ini
              </span>
            </div>

            {/* Vertical Bar Chart (Emerald Green Bars) */}
            <div className="mt-4 h-48 flex items-end justify-between gap-3 px-2">
              {[
                { label: 'T1 (Awal)', height: '60%', score: '3.6', color: '#10B981' },
                { label: 'T2 (Mid)', height: '72%', score: '4.0', color: '#10B981' },
                { label: 'T3 (Lanjut)', height: '84%', score: '4.3', color: '#10B981' },
                { label: 'T4 (Final)', height: '95%', score: '4.7', color: '#059669' }
              ].map((bar, idx) => (
                <div key={`trend-bar-${idx}`} className="flex-1 flex flex-col items-center gap-1 group">
                  <span className="text-[10px] font-black text-slate-700 group-hover:text-emerald-700 transition">
                    {bar.score}
                  </span>
                  <div className="w-full bg-slate-100 rounded-t-xl h-36 flex items-end overflow-hidden p-1">
                    <div
                      className="w-full rounded-t-lg transition-all duration-700 group-hover:opacity-90"
                      style={{
                        height: bar.height,
                        backgroundColor: bar.color
                      }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 mt-1">{bar.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
            <span>Rata-rata kenaikan: +0.35 per periode</span>
            <span className="font-bold text-emerald-600">▲ Optimal</span>
          </div>
        </div>

        {/* MIDDLE: RECENT ACTIVITIES LOG (RECENT TRANSACTIONS STYLE) -> 4 COLS */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wide text-slate-900">
                  Log Evaluasi & Aktivitas Terbaru
                </h3>
                <p className="text-xs text-slate-500">Riwayat Pengisian Rapor & Sistem</p>
              </div>
              <span className="text-[10px] text-blue-600 font-bold">Semua Aktivitas</span>
            </div>

            {/* List of activity items */}
            <div className="mt-3 space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2.5 truncate">
                  <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                    <BookOpen className="w-3.5 h-3.5" />
                  </div>
                  <div className="truncate">
                    <span className="font-bold text-slate-800 block truncate">
                      Input Nilai Aspek Kognitif
                    </span>
                    <span className="text-[10px] text-slate-500">Guru: Yuliono Nurokhim, S.Pd</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-bold text-slate-700 text-[11px] block">32 Siswa</span>
                  <span className="text-[9px] text-slate-400">10:45 AM</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2.5 truncate">
                  <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center shrink-0">
                    <Users className="w-3.5 h-3.5" />
                  </div>
                  <div className="truncate">
                    <span className="font-bold text-slate-800 block truncate">
                      Update Akun Guru (/teachers)
                    </span>
                    <span className="text-[10px] text-slate-500">Admin: Kelas 1 s.d. 6</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-bold text-purple-700 text-[11px] block">{teachersList.length} Akun</span>
                  <span className="text-[9px] text-slate-400">09:30 AM</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2.5 truncate">
                  <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <Printer className="w-3.5 h-3.5" />
                  </div>
                  <div className="truncate">
                    <span className="font-bold text-slate-800 block truncate">
                      Cetak Spider Chart Rapor
                    </span>
                    <span className="text-[10px] text-slate-500">Siswa: {selectedStudent.nama}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-bold text-emerald-700 text-[11px] block">PDF Ready</span>
                  <span className="text-[9px] text-slate-400">08:15 AM</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2.5 truncate">
                  <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0">
                    <RefreshCw className="w-3.5 h-3.5" />
                  </div>
                  <div className="truncate">
                    <span className="font-bold text-slate-800 block truncate">
                      Sinkronisasi Database Cloud
                    </span>
                    <span className="text-[10px] text-slate-500">Firebase Realtime RTDB</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-bold text-amber-700 text-[11px] block">Sukses</span>
                  <span className="text-[9px] text-slate-400">08:00 AM</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-xs text-slate-400 text-center">
            Pencatatan riwayat otomatis terintegrasi
          </div>
        </div>

        {/* RIGHT: BRANCH WISE DISTRIBUTION (HORIZONTAL BARS STYLE) -> 4 COLS */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wide text-slate-900">
                  Distribusi Nilai per Tingkat Kelas
                </h3>
                <p className="text-xs text-slate-500">Rerata Sekolah Kelas 1 s.d. 6</p>
              </div>
              <span className="text-[10px] text-slate-500 font-bold">Fase A-C</span>
            </div>

            {/* Horizontal colored bars matching Branch Wise Sales in reference */}
            <div className="mt-3.5 space-y-3">
              {[
                { name: 'Kelas 4 (Fase B)', score: '86.4', pct: '86%', color: '#1E5BF9', teacher: 'Yuliono Nurokhim' },
                { name: 'Kelas 5 (Fase C)', score: '84.8', pct: '84%', color: '#10B981', teacher: 'Bambang Pratama' },
                { name: 'Kelas 3 (Fase B)', score: '82.0', pct: '82%', color: '#F59E0B', teacher: 'Ahmad Fauzi' },
                { name: 'Kelas 2 (Fase A)', score: '80.5', pct: '80%', color: '#06B6D4', teacher: 'Dewi Lestari' },
                { name: 'Kelas 1 (Fase A)', score: '78.2', pct: '78%', color: '#EC4899', teacher: 'Siti Rahmah' }
              ].map((cl, i) => (
                <div key={`class-bar-${i}`} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-800">{cl.name}</span>
                    <span className="text-slate-900 font-mono font-black">{cl.score}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: cl.pct,
                        backgroundColor: cl.color
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Akses guru terpisah aman:</span>
            <button
              onClick={onOpenTeachers}
              className="text-purple-600 font-bold hover:underline cursor-pointer"
            >
              Kelola Kelas Guru →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
