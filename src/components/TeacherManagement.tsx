import React, { useState, useMemo } from 'react';
import {
  Users,
  UserCheck,
  UserPlus,
  Key,
  ShieldCheck,
  Edit3,
  Trash2,
  Search,
  Filter,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  School,
  GraduationCap,
  BookOpen,
  Layers,
  Printer,
  RefreshCw,
  ExternalLink,
  Info,
  Phone,
  Mail,
  Award,
  ChevronRight
} from 'lucide-react';
import { TeacherRecord } from '../firebase';
import { StudentRecord } from '../types/rapor';
import { UserAccount } from '../App';

interface TeacherManagementProps {
  teachers: TeacherRecord[];
  currentUser: UserAccount | null;
  students: StudentRecord[];
  onSaveTeacher: (data: Omit<TeacherRecord, 'id'>, id?: string) => Promise<void>;
  onDeleteTeacher: (id: string, name: string) => Promise<void>;
  onSelectClassForReview: (tingkatKelas: string, namaKelas: string) => void;
  onNavigateHome: () => void;
  isSyncing: boolean;
  firebaseConnected: boolean;
}

const TINGKAT_KELAS_OPTIONS = [
  { value: '1', label: 'Kelas 1 (Fase A)', defaultName: 'Kelas I (Fase A)', color: 'border-emerald-500 bg-emerald-50 text-emerald-800' },
  { value: '2', label: 'Kelas 2 (Fase A)', defaultName: 'Kelas II (Fase A)', color: 'border-teal-500 bg-teal-50 text-teal-800' },
  { value: '3', label: 'Kelas 3 (Fase B)', defaultName: 'Kelas III (Fase B)', color: 'border-cyan-500 bg-cyan-50 text-cyan-800' },
  { value: '4', label: 'Kelas 4 (Fase B)', defaultName: 'Kelas IV (Fase B)', color: 'border-amber-500 bg-amber-50 text-amber-800' },
  { value: '5', label: 'Kelas 5 (Fase C)', defaultName: 'Kelas V (Fase C)', color: 'border-blue-500 bg-blue-50 text-blue-800' },
  { value: '6', label: 'Kelas 6 (Fase C)', defaultName: 'Kelas VI (Fase C)', color: 'border-purple-500 bg-purple-50 text-purple-800' },
];

export const TeacherManagement: React.FC<TeacherManagementProps> = ({
  teachers = [],
  currentUser,
  students = [],
  onSaveTeacher,
  onDeleteTeacher,
  onSelectClassForReview,
  onNavigateHome,
  isSyncing,
  firebaseConnected
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTingkatFilter, setSelectedTingkatFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<TeacherRecord | null>(null);

  // Delete confirmation modal
  const [deleteModalTeacher, setDeleteModalTeacher] = useState<TeacherRecord | null>(null);

  // Form State
  const [formData, setFormData] = useState<Omit<TeacherRecord, 'id'>>({
    nama: '',
    tingkatKelas: '4',
    namaKelas: 'Kelas IV (Fase B)',
    username: '',
    niy: '',
    email: '',
    telepon: '',
    mataPelajaran: 'Wali Kelas',
    catatan: ''
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const handleOpenAddModal = () => {
    setEditingTeacher(null);
    setFormData({
      nama: '',
      tingkatKelas: '4',
      namaKelas: 'Kelas IV (Fase B)',
      username: '',
      niy: '',
      email: '',
      telepon: '',
      mataPelajaran: 'Wali Kelas',
      catatan: ''
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (teacher: TeacherRecord) => {
    setEditingTeacher(teacher);
    setFormData({
      nama: teacher.nama,
      tingkatKelas: teacher.tingkatKelas || '4',
      namaKelas: teacher.namaKelas || 'Kelas IV (Fase B)',
      username: teacher.username,
      niy: teacher.niy || '',
      email: teacher.email || '',
      telepon: teacher.telepon || '',
      mataPelajaran: teacher.mataPelajaran || 'Wali Kelas',
      catatan: teacher.catatan || ''
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleTingkatChange = (val: string) => {
    const opt = TINGKAT_KELAS_OPTIONS.find((o) => o.value === val);
    setFormData((prev) => ({
      ...prev,
      tingkatKelas: val,
      namaKelas: opt ? opt.defaultName : `Kelas ${val}`
    }));
  };

  const generateAutoCredentials = () => {
    const cleanName = formData.nama
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .slice(0, 8);
    const user = cleanName ? `guru_${cleanName}` : `guru${formData.tingkatKelas}_${Math.floor(100 + Math.random() * 900)}`;
    setFormData((prev) => ({
      ...prev,
      username: user
    }));
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.nama.trim()) errors.nama = 'Nama lengkap guru wajib diisi!';
    if (!formData.username.trim()) {
      errors.username = 'Username wajib diisi!';
    } else if (formData.username.length < 3) {
      errors.username = 'Username minimal 3 karakter!';
    }
    if (!formData.namaKelas.trim()) errors.namaKelas = 'Nama kelas binaan wajib diisi!';

    // Cek duplikasi username (kecuali milik sendiri saat edit)
    const duplicate = teachers.find(
      (t) => t.username.toLowerCase() === formData.username.toLowerCase() && t.id !== editingTeacher?.id
    );
    if (duplicate) {
      errors.username = `Username "${formData.username}" sudah digunakan oleh ${duplicate.nama}!`;
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    await onSaveTeacher(formData, editingTeacher?.id);
    setIsModalOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (!deleteModalTeacher) return;
    await onDeleteTeacher(deleteModalTeacher.id, deleteModalTeacher.nama);
    setDeleteModalTeacher(null);
  };

  // Filtered teachers list
  const filteredTeachers = useMemo(() => {
    return teachers.filter((t) => {
      const matchSearch =
        t.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.niy && t.niy.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (t.namaKelas && t.namaKelas.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (t.email && t.email.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchTingkat =
        selectedTingkatFilter === 'all' || t.tingkatKelas === selectedTingkatFilter;

      return matchSearch && matchTingkat;
    });
  }, [teachers, searchTerm, selectedTingkatFilter]);

  // Count student per class
  const getStudentCountForClass = (tingkatKelas: string, namaKelas: string) => {
    return students.filter((s) => {
      const sKelas = (s.kelas || '').toUpperCase();
      if (tingkatKelas === '4' && (sKelas.includes('IV') || sKelas.includes('4'))) return true;
      if (tingkatKelas === '1' && (sKelas.includes('I') && !sKelas.includes('IV') && !sKelas.includes('II') && !sKelas.includes('III'))) return true;
      if (tingkatKelas === '2' && (sKelas.includes('II') && !sKelas.includes('III'))) return true;
      if (tingkatKelas === '3' && sKelas.includes('III')) return true;
      if (tingkatKelas === '5' && sKelas.includes('V') && !sKelas.includes('IV') && !sKelas.includes('VI')) return true;
      if (tingkatKelas === '6' && sKelas.includes('VI')) return true;
      return s.kelas === namaKelas;
    }).length;
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* 1. HERO BANNER: Deep Navy Modern Enterprise Theme */}
      <div className="bg-[#0B1528] text-white rounded-2xl p-5 sm:p-7 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 border border-blue-400/40 text-blue-200 text-xs font-mono font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Firebase RTDB /teachers
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-300 text-xs font-semibold">
                Route: /teachers
              </span>
              {currentUser ? (
                <span className="px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1">
                  <UserCheck className="w-3 h-3 text-emerald-400" />
                  Sesi: {currentUser.role.toUpperCase()} ({currentUser.nama})
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xs font-semibold">
                  Mode Publik / Tamu
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-wide text-white flex items-center gap-2.5">
              <GraduationCap className="w-7 h-7 sm:w-8 sm:h-8 text-amber-400 shrink-0" />
              <span>MANAJEMEN AKUN GURU & KELAS BINAAN</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              Direktori profil guru, akun login, dan pembagian kelas binaan secara independen.
              Sistem menjamin <strong className="text-amber-300 font-semibold">pemisahan data rapor antar-kelas</strong> agar setiap wali kelas dapat mengelola rapor tanpa konflik data.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={onNavigateHome}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-2 transition shadow cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-amber-400" />
              Kembali
            </button>
            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2.5 rounded-xl bg-[#1E5BF9] hover:bg-blue-600 text-white text-xs font-bold flex items-center gap-2 transition shadow-lg shadow-blue-900/30 ring-2 ring-blue-400/40 cursor-pointer active:scale-95"
            >
              <UserPlus className="w-4 h-4 text-white" />
              Tambah Guru Baru
            </button>
          </div>
        </div>

        {/* Security & Access Badges */}
        <div className="mt-5 pt-4 border-t border-slate-800/90 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-800 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block font-bold">Pemisahan Kelas Mandiri</strong>
              <span className="text-slate-400 text-[11px]">
                Wali kelas hanya dapat mengedit dan mencetak data rapor kelas binaannya masing-masing.
              </span>
            </div>
          </div>

          <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-800 flex items-start gap-2.5">
            <Key className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block font-bold">Login Firebase Authentication</strong>
              <span className="text-slate-400 text-[11px]">
                Password tidak disimpan di profil guru atau Realtime Database.
              </span>
            </div>
          </div>

          <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-800 flex items-start gap-2.5">
            <Layers className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block font-bold">Akses Berbasis Peran</strong>
              <span className="text-slate-400 text-[11px]">
                Hak akses guru ditetapkan dari profil Firebase dan kelas binaan.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. STATS ROW: Clean Modern Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Total Akun Guru</span>
            <div className="text-2xl font-black text-slate-900 mt-0.5">{teachers.length} Guru</div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-[#1E5BF9] flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Kelas Binaan Aktif</span>
            <div className="text-2xl font-black text-slate-900 mt-0.5">
              {new Set(teachers.map((t) => t.tingkatKelas)).size} Tingkat
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <School className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Total Siswa Binaan</span>
            <div className="text-2xl font-black text-slate-900 mt-0.5">{students.length} Siswa</div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <BookOpen className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Koneksi Database</span>
            <div className="text-xs font-bold text-emerald-700 flex items-center gap-1.5 mt-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${firebaseConnected ? 'bg-emerald-500' : 'bg-rose-500'}`} />
              {firebaseConnected ? 'Terhubung Live' : 'Terputus'}
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
            <RefreshCw className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} />
          </div>
        </div>
      </div>

      {/* 3. TOOLBAR: Search & Filters */}
      <div className="bg-white rounded-2xl p-3.5 sm:p-4 shadow-sm border border-slate-200/80 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari nama guru, username, NIY, atau kelas binaan..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E5BF9] focus:bg-white transition"
            />
          </div>

          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="text-xs text-slate-500 hover:text-slate-800 underline font-medium cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-600 font-bold">
            <Filter className="w-3.5 h-3.5 text-[#1E5BF9]" />
            <span>Tingkat:</span>
          </div>

          <div className="flex flex-wrap items-center gap-1">
            <button
              onClick={() => setSelectedTingkatFilter('all')}
              className={`px-3 py-1.5 text-xs rounded-xl font-bold transition cursor-pointer ${
                selectedTingkatFilter === 'all'
                  ? 'bg-[#1E5BF9] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Semua ({teachers.length})
            </button>
            {TINGKAT_KELAS_OPTIONS.map((opt) => {
              const count = teachers.filter((t) => t.tingkatKelas === opt.value).length;
              return (
                <button
                  key={opt.value}
                  onClick={() => setSelectedTingkatFilter(opt.value)}
                  className={`px-2.5 py-1.5 text-xs rounded-xl font-bold transition cursor-pointer ${
                    selectedTingkatFilter === opt.value
                      ? 'bg-[#1E5BF9] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Kls {opt.value} {count > 0 && `(${count})`}
                </button>
              );
            })}
          </div>

          <div className="h-5 w-px bg-slate-200 hidden md:block mx-1" />

          <div className="flex items-center bg-slate-100 rounded-xl p-0.5 border border-slate-200">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                viewMode === 'grid' ? 'bg-white shadow text-[#1E5BF9]' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Kartu
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                viewMode === 'table' ? 'bg-white shadow text-[#1E5BF9]' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tabel
            </button>
          </div>
        </div>
      </div>

      {/* 4. DAFTAR GURU: VIEW KARTU (GRID) */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTeachers.map((teacher) => {
            const isCurrentLoggedIn = currentUser?.username === teacher.username;
            const studentCount = getStudentCountForClass(teacher.tingkatKelas, teacher.namaKelas);

            return (
              <div
                key={teacher.id}
                className={`bg-white rounded-2xl border transition-all duration-200 shadow-sm hover:shadow-lg flex flex-col justify-between overflow-hidden relative ${
                  isCurrentLoggedIn
                    ? 'border-emerald-500 ring-2 ring-emerald-200'
                    : 'border-slate-200/90 hover:border-blue-400'
                }`}
              >
                {/* Header Card */}
                <div className="p-4 bg-gradient-to-br from-slate-50 to-blue-50/30 border-b border-slate-200/80">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#0B1528] to-[#1E5BF9] text-white font-black text-base flex items-center justify-center shadow-md shrink-0">
                        {teacher.nama
                          .split(' ')
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join('')
                          .toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-slate-900 leading-snug line-clamp-1">
                          {teacher.nama}
                        </h3>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                          <Award className="w-3.5 h-3.5 text-[#1E5BF9] shrink-0" />
                          <span>{teacher.mataPelajaran || 'Wali Kelas'}</span>
                          {teacher.niy && (
                            <span className="font-mono text-[10px] text-slate-500">
                              • NIY: {teacher.niy}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {isCurrentLoggedIn && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wider shrink-0 shadow-xs">
                        Aktif
                      </span>
                    )}
                  </div>

                  {/* Badge Kelas Binaan */}
                  <div className="mt-3.5 flex items-center justify-between bg-white rounded-xl p-2.5 border border-slate-200 shadow-xs">
                    <div className="flex items-center gap-2">
                      <School className="w-4 h-4 text-blue-600 shrink-0" />
                      <div>
                        <span className="text-[10px] text-slate-400 font-semibold uppercase block leading-none">
                          Kelas Binaan:
                        </span>
                        <strong className="text-xs font-bold text-slate-900">
                          {teacher.namaKelas || `Kelas ${teacher.tingkatKelas}`}
                        </strong>
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-lg bg-blue-50 text-[#1E5BF9] text-[11px] font-bold font-mono">
                      {studentCount} Siswa
                    </span>
                  </div>
                </div>

                {/* Body Card: Account name & contact */}
                <div className="p-4 space-y-3 text-xs bg-white flex-1">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-600">
                    Username: <strong className="font-mono text-slate-800">{teacher.username}</strong>
                    <p className="mt-1">Password dikelola oleh Firebase Authentication dan tidak ditampilkan di sini.</p>
                  </div>

                  {/* Kontak & Email */}
                  {(teacher.email || teacher.telepon) && (
                    <div className="space-y-1 text-[11px] text-slate-500 pt-0.5">
                      {teacher.email && (
                        <div className="flex items-center gap-1.5 truncate">
                          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{teacher.email}</span>
                        </div>
                      )}
                      {teacher.telepon && (
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{teacher.telepon}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer Action Buttons */}
                <div className="p-3 bg-slate-50/90 border-t border-slate-200 flex flex-wrap items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1.5">
                    {/* Kelola Rapor Kelas */}
                    <button
                      onClick={() => onSelectClassForReview(teacher.tingkatKelas, teacher.namaKelas)}
                      className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#1E5BF9] border border-blue-200 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                      title="Buka data rapor kelas binaan guru ini"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Rapor Kelas</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Edit Guru */}
                    <button
                      onClick={() => handleOpenEditModal(teacher)}
                      className="p-2 rounded-xl bg-white hover:bg-blue-50 text-[#1E5BF9] border border-slate-200 hover:border-blue-400 transition cursor-pointer"
                      title="Edit Profil & Kelas Binaan"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    {/* Hapus Guru */}
                    <button
                      onClick={() => setDeleteModalTeacher(teacher)}
                      className="p-2 rounded-xl bg-white hover:bg-rose-50 text-rose-600 border border-slate-200 hover:border-rose-400 transition cursor-pointer"
                      title="Hapus Akun Guru"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredTeachers.length === 0 && (
            <div className="col-span-full bg-white rounded-2xl p-10 text-center border-2 border-dashed border-slate-200">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-700">Tidak ada akun guru yang ditemukan</h3>
              <p className="text-xs text-slate-500 mt-1">
                Silakan sesuaikan kata kunci pencarian atau klik tombol "Tambah Guru Baru".
              </p>
              <button
                onClick={handleOpenAddModal}
                className="mt-4 px-4 py-2 rounded-xl bg-[#1E5BF9] text-white font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer shadow"
              >
                <UserPlus className="w-4 h-4" /> Tambah Guru Baru
              </button>
            </div>
          )}
        </div>
      )}

      {/* 5. DAFTAR GURU: VIEW TABEL */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-700 border-b border-slate-200 font-bold uppercase text-[11px] tracking-wider">
                  <th className="p-3.5 text-center w-12">NO</th>
                  <th className="p-3.5">NAMA GURU & GELAR</th>
                  <th className="p-3.5">KELAS BINAAN</th>
                  <th className="p-3.5">USERNAME</th>
                  <th className="p-3.5">KONTAK / EMAIL</th>
                  <th className="p-3.5 text-center">SISWA</th>
                  <th className="p-3.5 text-center w-52">MENU AKSI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTeachers.map((teacher, idx) => {
                  const studentCount = getStudentCountForClass(teacher.tingkatKelas, teacher.namaKelas);
                  const isCurrentLoggedIn = currentUser?.username === teacher.username;

                  return (
                    <tr
                      key={teacher.id}
                      className={`hover:bg-blue-50/40 transition ${
                        isCurrentLoggedIn ? 'bg-emerald-50/60 font-semibold' : ''
                      }`}
                    >
                      <td className="p-3.5 text-center text-slate-400 font-mono">{idx + 1}</td>
                      <td className="p-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-blue-100 text-[#1E5BF9] font-bold flex items-center justify-center text-xs shrink-0">
                            {teacher.nama
                              .split(' ')
                              .map((n) => n[0])
                              .slice(0, 2)
                              .join('')
                              .toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <span>{teacher.nama}</span>
                              {isCurrentLoggedIn && (
                                <span className="px-1.5 py-0.2 rounded bg-emerald-600 text-white text-[9px] font-black">
                                  AKUN ANDA
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {teacher.mataPelajaran || 'Wali Kelas'} {teacher.niy && `• NIY: ${teacher.niy}`}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-[#1E5BF9] font-bold text-xs inline-block border border-blue-100">
                          {teacher.namaKelas || `Kelas ${teacher.tingkatKelas}`}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono font-bold text-slate-800">{teacher.username}</td>
                      <td className="p-3.5 text-slate-600">
                        {teacher.email || teacher.telepon ? (
                          <div className="space-y-0.5 text-[11px]">
                            {teacher.email && <div>{teacher.email}</div>}
                            {teacher.telepon && <div className="text-slate-500">{teacher.telepon}</div>}
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="p-3.5 text-center">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-800 rounded-lg font-mono font-bold text-xs">
                          {studentCount}
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onSelectClassForReview(teacher.tingkatKelas, teacher.namaKelas)}
                            className="p-1.5 rounded-lg bg-blue-50 text-[#1E5BF9] hover:bg-blue-100 border border-blue-200 cursor-pointer"
                            title="Buka Rapor Kelas"
                          >
                            <BookOpen className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(teacher)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 cursor-pointer"
                            title="Edit Guru"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteModalTeacher(teacher)}
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 cursor-pointer"
                            title="Hapus Guru"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. MODAL TAMBAH / EDIT GURU */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden my-6">
            <div className="bg-[#0B1528] p-4 sm:p-5 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#1E5BF9] flex items-center justify-center shadow">
                  {editingTeacher ? <Edit3 className="w-5 h-5 text-white" /> : <UserPlus className="w-5 h-5 text-white" />}
                </div>
                <div>
                  <h3 className="text-base font-black tracking-wide text-white">
                    {editingTeacher ? 'Edit Akun Guru & Kelas Binaan' : 'Tambah Guru & Kelas Binaan Baru'}
                  </h3>
                  <p className="text-xs text-slate-300">
                    Data akan otomatis tersimpan realtime ke Firebase RTDB (/teachers)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white text-lg font-bold px-2 py-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="p-4 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
              {/* Nama Guru */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nama Lengkap & Gelar Guru <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  placeholder="Contoh: Yuliono Nurokhim, S.Pd"
                  className={`w-full p-2.5 bg-slate-50 border rounded-xl focus:bg-white focus:outline-none focus:ring-2 ${
                    formErrors.nama ? 'border-rose-500 focus:ring-rose-400' : 'border-slate-200 focus:ring-blue-500'
                  }`}
                />
                {formErrors.nama && <span className="text-[11px] text-rose-600 font-bold">{formErrors.nama}</span>}
              </div>

              {/* Tingkat & Nama Kelas Binaan */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Tingkat Kelas Binaan <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.tingkatKelas}
                    onChange={(e) => handleTingkatChange(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500"
                  >
                    {TINGKAT_KELAS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Nama Resmi Kelas Binaan <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.namaKelas}
                    onChange={(e) => setFormData({ ...formData, namaKelas: e.target.value })}
                    placeholder="Contoh: Kelas IV (Fase B)"
                    className={`w-full p-2.5 bg-slate-50 border rounded-xl focus:bg-white focus:outline-none focus:ring-2 ${
                      formErrors.namaKelas ? 'border-rose-500 focus:ring-rose-400' : 'border-slate-200 focus:ring-blue-500'
                    }`}
                  />
                  {formErrors.namaKelas && <span className="text-[11px] text-rose-600 font-bold">{formErrors.namaKelas}</span>}
                </div>
              </div>

              {/* Username maps to a Firebase Authentication account provisioned by an administrator. */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5 text-xs">
                    <Key className="w-4 h-4 text-amber-500" />
                    Identitas Akun Guru
                  </span>
                  <button
                    type="button"
                    onClick={generateAutoCredentials}
                    className="text-[11px] text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-slate-200 cursor-pointer shadow-xs"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    Generate Otomatis
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Username Login <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/\s+/g, '') })}
                      placeholder="Contoh: guru4"
                      className={`w-full p-2.5 bg-white border rounded-xl font-mono focus:outline-none focus:ring-2 ${
                        formErrors.username ? 'border-rose-500 focus:ring-rose-400' : 'border-slate-200 focus:ring-blue-500'
                      }`}
                    />
                    {formErrors.username && <span className="text-[11px] text-rose-600 font-bold">{formErrors.username}</span>}
                  </div>

                </div>
                <p className="text-[11px] leading-relaxed text-slate-500">
                  Kata sandi akun tidak disimpan di database aplikasi. Buat akun login guru melalui Firebase Authentication, lalu daftarkan UID dan kelasnya pada profil akses.
                </p>
              </div>

              {/* Data Tambahan: NIY, Email, Telepon, Peran */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">NIY / NIP Guru</label>
                  <input
                    type="text"
                    value={formData.niy || ''}
                    onChange={(e) => setFormData({ ...formData, niy: e.target.value })}
                    placeholder="Contoh: 89070107222028"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Jabatan / Peran</label>
                  <input
                    type="text"
                    value={formData.mataPelajaran || ''}
                    onChange={(e) => setFormData({ ...formData, mataPelajaran: e.target.value })}
                    placeholder="Contoh: Wali Kelas IV / Guru Kelas"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email Dinas (Belajar.id)</label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="guru@guru.sd.belajar.id"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">No. WhatsApp / Telepon</label>
                  <input
                    type="text"
                    value={formData.telepon || ''}
                    onChange={(e) => setFormData({ ...formData, telepon: e.target.value })}
                    placeholder="0812xxxxxxxx"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSyncing}
                  className="px-5 py-2.5 rounded-xl bg-[#1E5BF9] hover:bg-blue-600 text-white font-bold shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSyncing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-white" />
                      {editingTeacher ? 'Simpan Perubahan' : 'Simpan Akun Guru'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. MODAL KONFIRMASI HAPUS GURU */}
      {deleteModalTeacher && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="bg-rose-600 p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-white" />
                <h3 className="font-bold text-sm uppercase text-white">Konfirmasi Hapus Akun Guru</h3>
              </div>
              <button
                onClick={() => setDeleteModalTeacher(null)}
                className="text-white hover:opacity-80 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-3.5 text-xs">
              <p className="text-slate-700 leading-relaxed">
                Apakah Anda yakin ingin menghapus akun guru <strong>"{deleteModalTeacher.nama}"</strong> (Kelas Binaan: {deleteModalTeacher.namaKelas})?
              </p>
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-[11px] text-rose-800">
                ⚠️ Tindakan ini akan menghapus akun login guru dari Firebase Realtime Database. Data rapor siswa tetap aman di sistem.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setDeleteModalTeacher(null)}
                  className="px-3.5 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={isSyncing}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow cursor-pointer disabled:opacity-50"
                >
                  Hapus Permanen
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
