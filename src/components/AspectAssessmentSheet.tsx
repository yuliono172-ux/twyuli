import React from 'react';
import { ChevronLeft, Printer, Search, CheckCircle2, Save } from 'lucide-react';
import { SiswaAssessmentRecord, SiswaData, PILIHAN_PREDIKAT } from '../types/rapor';

export type AspectId =
  | 'kognitif'
  | 'afektif'
  | 'psikomotor'
  | 'sosial'
  | 'islamic_literacy'
  | 'bilingual'
  | 'talents'
  | 'experience'
  | 'inklusivitas';

export interface AspectIndicatorConfig {
  key: string;
  code: string;
  title: string;
  subtitle: string;
  desc: string;
}

export interface AspectSheetConfig {
  id: AspectId;
  dataKey: keyof SiswaAssessmentRecord;
  title: string;
  badgeLabel: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  accentBg: string;
  accentText: string;
  indicators: AspectIndicatorConfig[];
}

export const ASPECT_CONFIGS: Record<AspectId, AspectSheetConfig> = {
  kognitif: {
    id: 'kognitif',
    dataKey: 'kognitif',
    title: 'KOGNITIF',
    badgeLabel: 'Dimensi 1: Kognitif',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-800',
    badgeBorder: 'border-amber-200',
    accentBg: 'bg-amber-100/70',
    accentText: 'text-amber-900',
    indicators: [
      { key: 'rp', code: 'RP', title: 'Rentang Perhatian (RP)', subtitle: 'Ketekunan Memperhatikan', desc: 'Kefokusan menerima pembelajaran di kelas' },
      { key: 'pi', code: 'PI', title: 'Pemahaman Instruksi (PI)', subtitle: 'Pemahaman Petunjuk Belajar', desc: 'Memahami instruksi / penjelasan yang diberikan' },
      { key: 'rm', code: 'RM', title: 'Rentang Memori (RM)', subtitle: 'Daya Ingat & Pemahaman', desc: 'Menghapal dan mengingat kembali informasi' },
      { key: 'pm', code: 'PM', title: 'Pemecahan Masalah (PM)', subtitle: 'Penyelesaian Masalah', desc: 'Kemampuan memecahkan kasus / permasalahan' },
      { key: 'kr', code: 'KR', title: 'Berpikir Kritis (KR)', subtitle: 'Ketelitian & Kritis', desc: 'Memeriksa, meneliti, dan mengamati secara jeli' },
      { key: 'ki', code: 'KI', title: 'Kreativitas / Inovasi (KI)', subtitle: 'Kreativitas & Ide Baru', desc: 'Memunculkan ide baru, inovasi, dan imajinasi' },
    ]
  },
  afektif: {
    id: 'afektif',
    dataKey: 'afektif',
    title: 'AFEKTIF',
    badgeLabel: 'Dimensi 2: Afektif',
    badgeBg: 'bg-blue-50',
    badgeText: 'text-blue-800',
    badgeBorder: 'border-blue-200',
    accentBg: 'bg-blue-100/70',
    accentText: 'text-blue-900',
    indicators: [
      { key: 'em', code: 'EM', title: 'Empati (EM)', subtitle: 'Kepedulian Sesama', desc: 'Kemampuan memahami perasaan orang lain' },
      { key: 'sh', code: 'SH', title: 'Suasana Hati (SH)', subtitle: 'Pengelolaan Suasana Hati', desc: 'Menjaga stabilitas suasana hati sehari-hari' },
      { key: 'mo', code: 'MO', title: 'Motivasi (MO)', subtitle: 'Semangat Belajar', desc: 'Terjaga semangatnya di setiap situasi belajar' },
      { key: 'ks', code: 'KS', title: 'Kesabaran (KS)', subtitle: 'Pengendalian Emosi', desc: 'Menjaga diri dari emosi yang meledak-ledak' },
      { key: 'kt', code: 'KT', title: 'Ketangguhan (KT)', subtitle: 'Pantang Menyerah', desc: 'Mampu bangkit dari kegagalan / kesedihan' },
    ]
  },
  psikomotor: {
    id: 'psikomotor',
    dataKey: 'psikomotor',
    title: 'PSIKOMOTOR',
    badgeLabel: 'Dimensi 3: Psikomotor',
    badgeBg: 'bg-rose-50',
    badgeText: 'text-rose-800',
    badgeBorder: 'border-rose-200',
    accentBg: 'bg-rose-100/70',
    accentText: 'text-rose-900',
    indicators: [
      { key: 'mk', code: 'MK', title: 'Motorik Kasar (MK)', subtitle: 'Koordinasi Gerak Tubuh', desc: 'Keseimbangan, melompat, berlari' },
      { key: 'mh', code: 'MH', title: 'Motorik Halus (MH)', subtitle: 'Keterampilan Tangan', desc: 'Menggambar sesuai pola, menulis rapi' },
      { key: 're', code: 'RE', title: 'Perilaku Repetitif (RE)', subtitle: 'Pengendalian Diri', desc: 'Mengendalikan perilaku berulang tidak perlu' },
      { key: 'kk', code: 'KK', title: 'Keluwesan (KK)', subtitle: 'Keluwesan Penggunaan Alat', desc: 'Kemampuan fisik & peralatan di sekitarnya' },
    ]
  },
  sosial: {
    id: 'sosial',
    dataKey: 'sosial',
    title: 'SOSIAL',
    badgeLabel: 'Dimensi 4: Sosial',
    badgeBg: 'bg-slate-100',
    badgeText: 'text-slate-800',
    badgeBorder: 'border-slate-300',
    accentBg: 'bg-slate-200/80',
    accentText: 'text-slate-900',
    indicators: [
      { key: 'ot', code: 'OT', title: 'Otoritas (OT)', subtitle: 'Kepatuhan Pada Kesepakatan', desc: 'Mengikuti tata tertib kelompok yang disepakati' },
      { key: 'ld', code: 'LD', title: 'Kepemimpinan (LD)', subtitle: 'Mengarahkan & Memimpin', desc: 'Kemampuan mempengaruhi & mengarahkan sesama' },
      { key: 'at', code: 'AT', title: 'Altruisme (AT)', subtitle: 'Ketulusan Membantu Sesama', desc: 'Kepedulian membantu secara tulus ikhlas' },
      { key: 'ko', code: 'KO', title: 'Komunikasi (KO)', subtitle: 'Penyampaian Gagasan', desc: 'Menyampaikan ide santun sampai dipahami' },
    ]
  },
  islamic_literacy: {
    id: 'islamic_literacy',
    dataKey: 'islamicLiteracy',
    title: 'ISLAMIC LITERACY',
    badgeLabel: 'Dimensi 5: Islamic Literacy',
    badgeBg: 'bg-purple-50',
    badgeText: 'text-purple-800',
    badgeBorder: 'border-purple-200',
    accentBg: 'bg-purple-100/70',
    accentText: 'text-purple-900',
    indicators: [
      { key: 'aq', code: 'AQ', title: 'Kecintaan Al-Qur\'an (AQ)', subtitle: 'Kecintaan Terhadap Al-Qur\'an', desc: 'Sikap & perilaku mencintai Al-Qur\'an' },
      { key: 'ak', code: 'AK', title: 'Akhlak Terpuji (AK)', subtitle: 'Perilaku & Akhlak Mulia', desc: 'Menunjukkan akhlak yang terpuji dan sopan' },
      { key: 'ib', code: 'IB', title: 'Semangat Beribadah (IB)', subtitle: 'Antusiasme Beribadah', desc: 'Antusiasme dan semangat shalat & berdoa' },
    ]
  },
  bilingual: {
    id: 'bilingual',
    dataKey: 'bilingual',
    title: 'BILINGUAL',
    badgeLabel: 'Dimensi 6: Bilingual',
    badgeBg: 'bg-cyan-50',
    badgeText: 'text-cyan-800',
    badgeBorder: 'border-cyan-200',
    accentBg: 'bg-cyan-100/70',
    accentText: 'text-cyan-900',
    indicators: [
      { key: 'kd', code: 'KD', title: 'Kepercayaan Diri (KD)', subtitle: 'Keberanian Berkomunikasi', desc: 'Percaya diri dwi-bahasa dalam keseharian' },
      { key: 'sb', code: 'SB', title: 'Semangat Belajar (SB)', subtitle: 'Eksplorasi Bahasa Baru', desc: 'Semangat mempelajari hal baru dwi-bahasa' },
    ]
  },
  talents: {
    id: 'talents',
    dataKey: 'talents',
    title: 'TALENTS',
    badgeLabel: 'Dimensi 7: Talents',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-800',
    badgeBorder: 'border-amber-200',
    accentBg: 'bg-amber-100/70',
    accentText: 'text-amber-900',
    indicators: [
      { key: 'uq', code: 'UQ', title: 'Keunikan (UQ)', subtitle: 'Karakter Unik & Positif', desc: 'Kekhasan pribadi positif mewarnai lingkungan' },
      { key: 'in', code: 'IN', title: 'Ketertarikan / Hobi (IN)', subtitle: 'Ketertarikan & Minat Positif', desc: 'Memiliki ketertarikan hobi yang positif' },
    ]
  },
  experience: {
    id: 'experience',
    dataKey: 'experience',
    title: 'EXPERIENCE',
    badgeLabel: 'Dimensi 8: Experience',
    badgeBg: 'bg-sky-50',
    badgeText: 'text-sky-800',
    badgeBorder: 'border-sky-200',
    accentBg: 'bg-sky-100/70',
    accentText: 'text-sky-900',
    indicators: [
      { key: 'ex', code: 'EX', title: 'Eksplorasi (EX)', subtitle: 'Keberanian Mencoba Hal Baru', desc: 'Ketertarikan untuk mencoba hal baru' },
      { key: 'ob', code: 'OB', title: 'Observatif (OB)', subtitle: 'Kemampuan Mengamati', desc: 'Kejelian saat mengamati sebuah peristiwa' },
      { key: 're', code: 'RE', title: 'Refleksi (RE)', subtitle: 'Penarikan Pelajaran', desc: 'Mengambil kesimpulan dari sebuah kejadian' },
    ]
  },
  inklusivitas: {
    id: 'inklusivitas',
    dataKey: 'inklusivitas',
    title: 'INKLUSIVITAS',
    badgeLabel: 'Dimensi 9: Inklusivitas',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-800',
    badgeBorder: 'border-emerald-200',
    accentBg: 'bg-emerald-100/70',
    accentText: 'text-emerald-900',
    indicators: [
      { key: 'so', code: 'SO', title: 'Solidaritas (SO)', subtitle: 'Kepedulian & Saling Berbagi', desc: 'Peduli teman yang butuh bantuan, tak segan berbagi' },
      { key: 'fa', code: 'FA', title: 'Keadilan (FA)', subtitle: 'Sikap Adil & Merangkul', desc: 'Memperlakukan teman adil tanpa diskriminasi' },
      { key: 'ph', code: 'PH', title: 'Penghormatan (PH)', subtitle: 'Sikap Saling Menghargai', desc: 'Respek orang lain, anti-bullying atas kekurangan' },
    ]
  }
};

export interface AspectAssessmentSheetProps {
  aspectId: AspectId | string;
  selectedTriwulan?: string;
  activeTriwulan?: string;
  searchTerm?: string;
  setSearchTerm?: (s: string) => void;
  dataSiswa?: SiswaData[];
  filteredSiswa?: SiswaData[];
  onUpdateField?: (no: number, key: string, val: string) => void;
  updateStudentField?: (no: number, section: keyof SiswaAssessmentRecord, key: string, val: string) => void;
  onNavigateHome: () => void;
  onSave?: () => void;
  isFirebaseSyncing?: boolean;
}

export const AspectAssessmentSheet: React.FC<AspectAssessmentSheetProps> = ({
  aspectId,
  selectedTriwulan,
  activeTriwulan,
  searchTerm = '',
  setSearchTerm,
  dataSiswa,
  filteredSiswa,
  onUpdateField,
  updateStudentField,
  onNavigateHome,
  onSave,
  isFirebaseSyncing = false
}) => {
  const config = ASPECT_CONFIGS[aspectId as AspectId] || ASPECT_CONFIGS.kognitif;
  const currentTriwulan = activeTriwulan || selectedTriwulan || 'T1';
  const students = filteredSiswa || dataSiswa || [];

  const handleFieldChange = (studentNo: number, fieldKey: string, value: string) => {
    if (onUpdateField) {
      onUpdateField(studentNo, fieldKey, value);
    } else if (updateStudentField) {
      updateStudentField(studentNo, config.dataKey, fieldKey, value);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/90 p-4 sm:p-7 space-y-6 animate-fadeIn">
      {/* 1. HEADER BAR */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="flex items-center gap-3">
          <button
            onClick={onNavigateHome}
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-2 border border-slate-300 shadow-xs transition cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 text-slate-600" /> HOME
          </button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${config.badgeBg} ${config.badgeText} ${config.badgeBorder}`}>
                {config.badgeLabel}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[#1E5BF9] border border-blue-200 text-xs font-bold font-mono">
                {currentTriwulan}
              </span>
              <h2 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-tight">
                TABEL PENILAIAN {config.title}
              </h2>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Lembar input evaluasi capaian perkembangan peserta didik berdasarkan indikator kurikulum merdeka.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {setSearchTerm && (
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari Siswa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#1E5BF9] focus:outline-none transition w-44 sm:w-56"
              />
            </div>
          )}
          {onSave && (
            <button
              onClick={onSave}
              disabled={isFirebaseSyncing}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isFirebaseSyncing ? 'Menyimpan...' : 'Simpan'}</span>
            </button>
          )}
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 bg-[#0B1528] hover:bg-[#152542] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-blue-400" />
            <span>Cetak</span>
          </button>
        </div>
      </div>

      {/* 2. TABEL DATA NILAI MODEREN */}
      <div className="overflow-x-auto border border-slate-200 rounded-2xl shadow-sm bg-white">
        <table className="w-full text-xs border-collapse">
          <thead>
            {/* ROW 1: KATEGORI UTAMA */}
            <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 text-center uppercase tracking-wider text-[11px]">
              <th rowSpan={3} className="border-r border-slate-200 p-3 w-12">NO</th>
              <th rowSpan={3} className="border-r border-slate-200 p-3 min-w-[200px] text-left">NAMA PESERTA DIDIK</th>
              <th rowSpan={3} className="border-r border-slate-200 p-3 w-28 text-center font-mono">NIS</th>
              <th rowSpan={3} className="border-r border-slate-200 p-3 w-28 text-center">KELAS</th>
              <th
                colSpan={config.indicators.length}
                className={`border-r border-slate-200 p-2 font-black text-xs uppercase tracking-wider ${config.accentBg} ${config.accentText}`}
              >
                {config.title} ({config.indicators.length} INDIKATOR PENILAIAN)
              </th>
              <th rowSpan={3} className="p-3 min-w-[240px] text-center font-bold">DESKRIPSI CAPAIAN</th>
            </tr>

            {/* ROW 2: NAMA INDIKATOR RESMI */}
            <tr className="text-[11px] border-b border-slate-200 text-center font-semibold bg-slate-50/70">
              {config.indicators.map((ind, i) => (
                <th
                  key={ind.key}
                  className={`border-r border-slate-200 p-2 text-slate-800 ${i % 2 === 0 ? 'bg-slate-100/50' : 'bg-white'}`}
                  title={ind.desc}
                >
                  <div className="font-bold">{ind.title}</div>
                  <div className="text-[10px] text-slate-500 font-normal">{ind.desc}</div>
                </th>
              ))}
            </tr>

            {/* ROW 3: FOKUS & DESKRIPTOR */}
            <tr className="bg-slate-100/90 text-slate-700 text-[10px] font-bold border-b-2 border-slate-300 text-center">
              {config.indicators.map((ind) => (
                <th key={`sub-${ind.key}`} className="border-r border-slate-200 p-1.5 font-semibold text-slate-600">
                  {ind.subtitle}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {students.length === 0 ? (
              <tr>
                <td colSpan={config.indicators.length + 5} className="p-8 text-center text-slate-400">
                  Tidak ada data siswa ditemukan untuk kriteria pencarian ini.
                </td>
              </tr>
            ) : (
              students.map((siswa) => {
                const aspectData = ((siswa as any)?.[config.dataKey] as any) || {};

                return (
                  <tr key={siswa.no} className="hover:bg-blue-50/30 transition">
                    {/* NO */}
                    <td className="border-r border-slate-100 p-2.5 text-center font-bold text-slate-400 font-mono">
                      {siswa.no}
                    </td>

                    {/* NAMA */}
                    <td className="border-r border-slate-100 p-2.5 font-bold text-slate-900 whitespace-nowrap">
                      {siswa.nama}
                    </td>

                    {/* NIS */}
                    <td className="border-r border-slate-100 p-2.5 text-center font-mono text-slate-600">
                      {siswa.nis}
                    </td>

                    {/* KELAS */}
                    <td className="border-r border-slate-100 p-2.5 text-center text-slate-600 whitespace-nowrap">
                      {siswa.kelas}
                    </td>

                    {/* NILAI DROPDOWNS PER INDIKATOR */}
                    {config.indicators.map((ind, i) => {
                      const currentVal = aspectData[ind.key] || '';
                      return (
                        <td
                          key={ind.key}
                          className={`border-r border-slate-100 p-1 text-center ${
                            i % 2 === 0 ? 'bg-slate-50/40' : 'bg-white'
                          }`}
                        >
                          <select
                            value={currentVal}
                            onChange={(e) => handleFieldChange(siswa.no, ind.key, e.target.value)}
                            className="w-full text-center text-xs p-1.5 font-bold rounded-lg border border-slate-200 bg-white hover:bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none cursor-pointer transition"
                          >
                            <option value="">--</option>
                            {PILIHAN_PREDIKAT.map((p) => (
                              <option key={p} value={p}>
                                {p}
                              </option>
                            ))}
                          </select>
                        </td>
                      );
                    })}

                    {/* DESKRIPSI TEXTAREA */}
                    <td className="p-1.5">
                      <textarea
                        rows={2}
                        value={aspectData.deskripsi || ''}
                        onChange={(e) => handleFieldChange(siswa.no, 'deskripsi', e.target.value)}
                        className="w-full text-[11px] p-2 border border-slate-200 rounded-xl bg-slate-50/60 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition"
                        placeholder={`Deskripsi capaian ${config.title.toLowerCase()} siswa...`}
                      />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* 3. FOOTER INFO */}
      <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Setiap perubahan nilai tersimpan otomatis dan terhubung ke Sheet DBTW & Cetak Rapor Resmi.</span>
        </div>
        <div className="font-mono text-[11px] text-slate-500">
          Total: {students.length} Peserta Didik
        </div>
      </div>
    </div>
  );
};
