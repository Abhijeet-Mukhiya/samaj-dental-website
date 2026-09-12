import { useEffect, useMemo, useState } from 'react';
import {
  Activity, CalendarDays, CheckCircle2, Clock3, LayoutDashboard,
  LogOut, Menu, Search, Settings, ShieldCheck, Stethoscope, Users,
  Plus, Bell, MoreHorizontal, FileText, Loader2, RefreshCw, AlertCircle, Shield
} from 'lucide-react';
import { clinicConfig } from '../config/clinic';
import { getCurrentStaffUser, loginWithEmailAndPassword, logoutStaff, UserProfile } from '../services/authService';
import {
  AppointmentRecord, AuditLogRecord, fetchAppointmentsList, fetchAuditLogs,
  updateAppointmentStatus
} from '../services/appointmentBackendService';
import { DoctorRecord, createDoctor, fetchDoctorsList, toggleDoctorActive, updateDoctor } from '../services/doctorService';
import { createService, fetchServicesList, ServiceRecord, toggleServiceActive, updateService } from '../services/serviceService';
import { isSupabaseConfigured } from '../lib/supabase';
import { loginBlocked, recordFailedLogin } from '../utils/adminSecurity';

type Status = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';

function StatusBadge({ status }: { status: Status }) {
  const styles: Record<Status, string> = {
    pending: 'bg-amber-50 text-amber-700 ring-amber-200',
    confirmed: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    completed: 'bg-sky-50 text-sky-700 ring-sky-200',
    cancelled: 'bg-rose-50 text-rose-700 ring-rose-200',
    no_show: 'bg-slate-100 text-slate-700 ring-slate-200',
  };
  const labels: Record<Status, string> = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    completed: 'Completed',
    cancelled: 'Cancelled',
    no_show: 'No-show',
  };
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${styles[status]}`}>{labels[status]}</span>;
}

export function AdminDashboardPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [appointments, setAppointments] = useState<AppointmentRecord[]>([]);
  const [doctors, setDoctors] = useState<DoctorRecord[]>([]);
  const [services, setServices] = useState<ServiceRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogRecord[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  const [tab, setTab] = useState('Overview');
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | Status>('All');
  const [mobileNav, setMobileNav] = useState(false);
  const [editor, setEditor] = useState<{ kind: 'doctor' | 'service'; item?: DoctorRecord | ServiceRecord } | null>(null);

  // Check auth session on mount
  useEffect(() => {
    async function initAuth() {
      setLoadingUser(true);
      const currentUser = await getCurrentStaffUser();
      setUser(currentUser);
      setLoadingUser(false);
    }
    initAuth();
  }, []);

  // Load clinic data when logged in
  const loadData = async () => {
    if (!user) return;
    setLoadingData(true);
    const [apptsData, docsData, svcsData, auditData] = await Promise.all([
      fetchAppointmentsList(user.clinicId),
      fetchDoctorsList({ includeInactive: true }),
      fetchServicesList({ includeInactive: true }),
      fetchAuditLogs(user.clinicId),
    ]);

    // Role-based filtering for DOCTOR role: show only appointments assigned to this doctor
    let roleFilteredAppts = apptsData;
    if (user.role === 'doctor') {
      roleFilteredAppts = apptsData.filter(
        (a) => Boolean(user.doctorId && a.doctor_id === user.doctorId)
      );
    }

    setAppointments(roleFilteredAppts);
    setDoctors(docsData);
    setServices(svcsData);
    setAuditLogs(auditData);
    setLoadingData(false);
  };

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const today = new Date().toISOString().slice(0, 10);
  const metrics = useMemo(() => ({
    today: appointments.filter((a) => a.appointment_date === today && a.status !== 'cancelled').length,
    pending: appointments.filter((a) => a.status === 'pending').length,
    confirmed: appointments.filter((a) => a.status === 'confirmed').length,
    completed: appointments.filter((a) => a.status === 'completed').length,
  }), [appointments, today]);

  const filteredAppointments = appointments.filter((a) => {
    const matchesQuery = `${a.patient_name} ${a.patient_phone} ${a.service_name} ${a.doctor_name}`.toLowerCase().includes(query.toLowerCase());
    return matchesQuery && (statusFilter === 'All' || a.status === statusFilter);
  });

  const handleStatusChange = async (id: string, nextStatus: Status) => {
    if (!user) return;
    const success = await updateAppointmentStatus(id, nextStatus, user.role);
    if (!success) {
      await loadData();
      return;
    }
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status: nextStatus } : a)));
    const updatedAudit = await fetchAuditLogs(user.clinicId);
    setAuditLogs(updatedAudit);
  };

  const handleToggleDoctor = async (id: string) => {
    if (user?.role !== 'admin') return;
    const doctor = doctors.find((d) => d.id === id);
    if (!doctor) return;
    const success = await toggleDoctorActive(id, !doctor.active);
    if (success) {
      setDoctors((prev) => prev.map((d) => (d.id === id ? { ...d, active: !d.active } : d)));
    }
  };

  const handleToggleService = async (id: string) => {
    if (user?.role !== 'admin') return;
    const service = services.find((s) => s.id === id);
    if (!service) return;
    const success = await toggleServiceActive(id, !service.active);
    if (success) {
      setServices((prev) => prev.map((s) => (s.id === id ? { ...s, active: !s.active } : s)));
    }
  };

  const handleSaveDoctor = async (values: DoctorFormValues | ServiceFormValues) => {
    if (!('specialization' in values)) return false;
    if (user?.role !== 'admin' || !values.name.trim()) return false;
    const current = editor?.item && 'specialization' in editor.item ? editor.item : undefined;
    const saved = current
      ? await updateDoctor(current.id, values)
      : await createDoctor({ clinicId: user.clinicId, ...values });
    if (!saved) return false;
    await loadData();
    setEditor(null);
    return true;
  };

  const handleSaveService = async (values: DoctorFormValues | ServiceFormValues) => {
    if (!('durationMinutes' in values)) return false;
    if (user?.role !== 'admin' || !values.name.trim()) return false;
    const current = editor?.item && !('specialization' in editor.item) ? editor.item : undefined;
    const saved = current
      ? await updateService(current.id, values)
      : await createService({ clinicId: user.clinicId, ...values });
    if (!saved) return false;
    await loadData();
    setEditor(null);
    return true;
  };

  if (loadingUser) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-950 text-white">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
          <p className="text-sm font-semibold">Loading Samaj Dental Admin Portal...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AdminLogin onLoggedIn={(u) => setUser(u)} />;
  }

  const navItems = [
    ['Overview', LayoutDashboard],
    ['Appointments', CalendarDays],
    ['Doctors', Stethoscope],
    ['Services', Activity],
    ['Audit Logs', FileText],
    ['Settings', Settings],
  ] as const;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className={`${mobileNav ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-40 w-72 border-r border-slate-200 bg-white p-5 shadow-xl transition-transform lg:static lg:translate-x-0 lg:shadow-none flex flex-col justify-between`}>
          <div>
            <div className="flex items-center gap-3 px-2 py-2">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-teal-600 text-white">
                <Stethoscope size={23} />
              </div>
              <div>
                <p className="font-black text-slate-900">Samaj Dental</p>
                <p className="text-xs font-semibold text-teal-700">Pepsicola Clinic Admin</p>
              </div>
            </div>

            <div className="mt-8 space-y-1">
              {navItems.map(([label, Icon]) => (
                <button
                  key={label}
                  onClick={() => {
                    setTab(label);
                    setMobileNav(false);
                  }}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold transition ${
                    tab === label ? 'bg-teal-50 text-teal-700' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Icon size={18} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100">
            <div className="rounded-2xl bg-slate-900 p-4 text-white">
              <div className="flex items-center justify-between">
                <ShieldCheck size={20} className="text-emerald-400" />
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-teal-900 text-teal-200">
                  {user.role}
                </span>
              </div>
              <p className="mt-3 text-xs font-bold text-white">{user.name}</p>
              <p className="mt-0.5 text-[11px] text-slate-400">{user.email}</p>
              <p className="mt-2 text-[10px] text-emerald-400 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {isSupabaseConfigured ? 'Connected to Supabase DB' : 'Local Sandbox Mode'}
              </p>
            </div>

            <button
              onClick={async () => {
                await logoutStaff();
                setUser(null);
              }}
              className="mt-3 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition"
            >
              <LogOut size={18} /> Sign out
            </button>
          </div>
        </aside>

        {mobileNav && <button aria-label="Close navigation" className="fixed inset-0 z-30 bg-slate-900/30 lg:hidden" onClick={() => setMobileNav(false)} />}

        {/* Main Content */}
        <main className="min-w-0 flex-1 flex flex-col">
          <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur md:px-8">
            <div className="flex items-center gap-3">
              <button className="rounded-xl p-2 hover:bg-slate-100 lg:hidden" onClick={() => setMobileNav(true)}>
                <Menu />
              </button>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-teal-600">Clinic management</p>
                <h1 className="text-xl font-black md:text-2xl">{tab}</h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={loadData}
                disabled={loadingData}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                title="Refresh database records"
              >
                <RefreshCw size={14} className={loadingData ? 'animate-spin' : ''} />
                <span className="hidden sm:inline">Refresh</span>
              </button>

              <div className="rounded-xl p-2.5 text-slate-400" title="Notifications are not configured">
                <Bell size={19} aria-hidden="true" />
              </div>

              <div className="hidden items-center gap-3 border-l border-slate-200 pl-4 sm:flex">
                <div className="grid h-9 w-9 place-items-center rounded-full bg-teal-100 font-black text-teal-700 uppercase">
                  {user.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-bold">{user.name}</p>
                  <p className="text-xs text-slate-500 capitalize">{user.role} Staff</p>
                </div>
              </div>
            </div>
          </header>

          <div className="p-4 md:p-8 flex-1">
            {tab === 'Overview' && <Overview metrics={metrics} appointments={appointments} setTab={setTab} onStatusChange={handleStatusChange} />}
            {tab === 'Appointments' && (
              <AppointmentsTab
                appointments={filteredAppointments}
                query={query}
                setQuery={setQuery}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                onStatusChange={handleStatusChange}
                userRole={user.role}
              />
            )}
            {tab === 'Doctors' && <ManagementTab title="Doctors" icon={<Stethoscope />} items={doctors} onToggle={handleToggleDoctor} userRole={user.role} onAdd={() => setEditor({ kind: 'doctor' })} onEdit={(item) => setEditor({ kind: 'doctor', item })} />}
            {tab === 'Services' && <ManagementTab title="Services" icon={<Activity />} items={services} onToggle={handleToggleService} userRole={user.role} onAdd={() => setEditor({ kind: 'service' })} onEdit={(item) => setEditor({ kind: 'service', item })} />}
            {tab === 'Audit Logs' && <AuditLogsTab logs={auditLogs} userRole={user.role} />}
            {tab === 'Settings' && <SettingsPanel user={user} />}
          </div>
        </main>
      </div>
      {editor && (
        <ManagementEditor
          kind={editor.kind}
          item={editor.item}
          onClose={() => setEditor(null)}
          onSave={editor.kind === 'doctor' ? handleSaveDoctor : handleSaveService}
        />
      )}
    </div>
  );
}

function AdminLogin({ onLoggedIn }: { onLoggedIn: (u: UserProfile) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [lockedFor, setLockedFor] = useState(0);

  useEffect(() => {
    const update = () => setLockedFor(loginBlocked());
    update();
    const id = window.setInterval(update, 1000);
    return () => window.clearInterval(id);
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const remaining = loginBlocked();
    if (remaining > 0) {
      setLockedFor(remaining);
      return;
    }

    setLoading(true);
    setError('');

    const res = await loginWithEmailAndPassword(email, password);
    setLoading(false);

    if (res.user) {
      onLoggedIn(res.user);
    } else {
      const locked = recordFailedLogin();
      setLockedFor(locked);
      setError(res.error || (locked ? 'Too many failed attempts. Try again in 5 minutes.' : 'Invalid credentials.'));
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-slate-950 p-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-teal-600 text-white">
          <Stethoscope size={28} />
        </div>
        <h1 className="mt-6 text-center text-2xl font-black text-slate-900">Clinic Staff Portal</h1>
        <p className="mt-2 text-center text-sm text-slate-500">Authorized personnel for {clinicConfig.logoText}</p>

        <div className="mt-6 rounded-2xl border border-teal-100 bg-teal-50/60 p-4 text-xs text-teal-900 leading-relaxed">
          <p className="font-bold flex items-center gap-1.5">
            <ShieldCheck size={16} className="text-teal-600" />
            {isSupabaseConfigured ? 'Production Supabase Auth Enabled' : 'Development Demo Sandbox Mode'}
          </p>
          <p className="mt-1 text-slate-600">
            {isSupabaseConfigured
              ? 'Enter your assigned clinic credentials. All appointment actions are isolated and audited.'
              : 'Use the locally configured demo password to inspect staff features. Demo authentication is disabled in production.'}
          </p>
        </div>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Staff Email
            <input
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              placeholder="staff@samajdental.com"
              disabled={lockedFor > 0 || loading}
            />
          </label>

          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Password
            <input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              placeholder="Enter password"
              disabled={lockedFor > 0 || loading}
            />
          </label>

          {error && (
            <p role="alert" className="text-xs font-semibold text-rose-600 flex items-center gap-1">
              <AlertCircle size={14} /> {error}
            </p>
          )}

          {lockedFor > 0 && (
            <p className="text-xs font-semibold text-slate-500">
              Login temporarily locked. Try again in {Math.ceil(lockedFor / 1000)}s.
            </p>
          )}

          <button
            type="submit"
            disabled={lockedFor > 0 || loading}
            className="w-full rounded-xl bg-teal-600 px-4 py-3.5 font-black text-white hover:bg-teal-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : 'Authenticate & Enter Dashboard'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-400">
          Security: Supabase Auth + PostgreSQL RLS + Scoped Clinic Isolation.
        </p>
      </div>
    </div>
  );
}

function Overview({
  metrics,
  appointments,
  setTab,
  onStatusChange,
}: {
  metrics: { today: number; pending: number; confirmed: number; completed: number };
  appointments: AppointmentRecord[];
  setTab: (s: string) => void;
  onStatusChange: (id: string, s: Status) => void;
}) {
  const cards = [
    ['Today', metrics.today, CalendarDays],
    ['Pending', metrics.pending, Clock3],
    ['Confirmed', metrics.confirmed, CheckCircle2],
    ['Completed', metrics.completed, Users],
  ] as const;

  return (
    <div className="space-y-7">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(([label, value, Icon]) => (
          <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-500">{label}</span>
              <span className="rounded-xl bg-teal-50 p-2.5 text-teal-600">
                <Icon size={20} />
              </span>
            </div>
            <p className="mt-4 text-3xl font-black">{value}</p>
            <p className="mt-1 text-xs font-semibold text-slate-400">Live database records</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 p-5">
            <div>
              <h2 className="font-black">Recent appointments</h2>
              <p className="mt-1 text-xs text-slate-500">Latest patient requests & status updates.</p>
            </div>
            <button onClick={() => setTab('Appointments')} className="text-sm font-black text-teal-700 hover:underline">
              View all
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {appointments.slice(0, 5).map((a) => (
              <div key={a.id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-teal-100 font-black text-teal-800 uppercase">
                    {a.patient_name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{a.patient_name}</p>
                    <p className="text-xs text-slate-500">
                      {a.appointment_date} • {a.appointment_time} • {a.service_name}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <StatusBadge status={a.status} />
                  <select
                    value={a.status}
                    onChange={(e) => onStatusChange(a.id, e.target.value as Status)}
                    className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs font-bold outline-none"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="no_show">No-show</option>
                  </select>
                </div>
              </div>
            ))}
            {appointments.length === 0 && (
              <div className="p-8 text-center text-sm font-semibold text-slate-500">No appointments recorded yet.</div>
            )}
          </div>
        </section>

        <section className="rounded-2xl bg-slate-900 p-6 text-white flex flex-col justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-teal-300">Quick action</p>
            <h2 className="mt-2 text-2xl font-black">Daily Roster</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Review and confirm pending patient appointments for Samaj Dental Care Clinic - Pepsicola Chowk.
            </p>
          </div>

          <button
            onClick={() => setTab('Appointments')}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 font-black text-slate-900 hover:bg-slate-100 transition"
          >
            <CalendarDays size={18} /> Manage appointments
          </button>
        </section>
      </div>
    </div>
  );
}

function AppointmentsTab({
  appointments,
  query,
  setQuery,
  statusFilter,
  setStatusFilter,
  onStatusChange,
  userRole,
}: {
  appointments: AppointmentRecord[];
  query: string;
  setQuery: (s: string) => void;
  statusFilter: 'All' | Status;
  setStatusFilter: (s: 'All' | Status) => void;
  onStatusChange: (id: string, s: Status) => void;
  userRole: string;
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-black">Appointment Management</h2>
          <p className="mt-1 text-sm text-slate-500">
            {userRole === 'doctor'
              ? 'Showing appointments assigned to your doctor identity.'
              : 'Clinic appointments scoped to this tenant identity.'}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3.5 text-slate-400" size={18} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-teal-500"
            placeholder="Search by patient name, phone, service..."
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as 'All' | Status)}
          className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none"
        >
          <option value="All">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="no_show">No-show</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-4">Patient</th>
                <th className="px-5 py-4">Date / time</th>
                <th className="px-5 py-4">Service</th>
                <th className="px-5 py-4">Doctor</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {appointments.map((a) => (
                <tr key={a.id}>
                  <td className="px-5 py-4">
                    <p className="font-bold text-slate-900">{a.patient_name}</p>
                    <p className="text-xs text-slate-500">{a.patient_phone}</p>
                    {a.patient_email && <p className="text-[11px] text-slate-400">{a.patient_email}</p>}
                  </td>
                  <td className="px-5 py-4 font-semibold">
                    {a.appointment_date}
                    <br />
                    <span className="text-xs text-slate-500">{a.appointment_time}</span>
                  </td>
                  <td className="px-5 py-4 font-medium">{a.service_name}</td>
                  <td className="px-5 py-4 text-xs text-slate-600">{a.doctor_name}</td>
                  <td className="px-5 py-4">
                    <StatusBadge status={a.status} />
                  </td>
                  <td className="px-5 py-4">
                    <select
                      value={a.status}
                      onChange={(e) => onStatusChange(a.id, e.target.value as Status)}
                      className="rounded-lg border border-slate-200 px-2 py-2 text-xs font-bold outline-none"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="no_show">No-show</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="divide-y divide-slate-100 md:hidden">
          {appointments.map((a) => (
            <div key={a.id} className="p-5 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-black text-slate-900">{a.patient_name}</p>
                  <p className="text-xs text-slate-500">{a.patient_phone}</p>
                </div>
                <StatusBadge status={a.status} />
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-slate-400">Date & Time</p>
                  <p className="font-bold">{a.appointment_date} • {a.appointment_time}</p>
                </div>
                <div>
                  <p className="text-slate-400">Service</p>
                  <p className="font-bold">{a.service_name}</p>
                </div>
              </div>

              <select
                value={a.status}
                onChange={(e) => onStatusChange(a.id, e.target.value as Status)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-bold"
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="no_show">No-show</option>
              </select>
            </div>
          ))}
        </div>

        {appointments.length === 0 && (
          <div className="p-12 text-center text-sm font-semibold text-slate-500">
            No appointments match your filters.
          </div>
        )}
      </div>
    </div>
  );
}

function ManagementTab({
  title,
  icon,
  items,
  onToggle,
  userRole,
  onAdd,
  onEdit,
}: {
  title: string;
  icon: React.ReactNode;
  items: Array<DoctorRecord | ServiceRecord>;
  onToggle: (id: string) => void;
  userRole: string;
  onAdd: () => void;
  onEdit: (item: DoctorRecord | ServiceRecord) => void;
}) {
  const canManage = userRole === 'admin';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black">{title} Catalog</h2>
          <p className="mt-1 text-sm text-slate-500">Manage active records and availability.</p>
        </div>
        {canManage && (
          <button onClick={onAdd} className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-3 text-sm font-black text-white hover:bg-teal-700 transition">
            <Plus size={17} /> Add {title.slice(0, -1)}
          </button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => {
          const isDoctor = 'specialization' in item;
          return (
            <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-teal-50 text-teal-700">{icon}</div>
                <button onClick={() => onEdit(item)} aria-label={`Edit ${item.name}`} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                  <MoreHorizontal size={18} aria-hidden="true" />
                </button>
              </div>

              <h3 className="mt-5 font-black text-slate-900">{item.name}</h3>
              <p className="mt-1 text-sm text-slate-500">
                {isDoctor ? (item as DoctorRecord).specialization : `${(item as ServiceRecord).category} • ${(item as ServiceRecord).duration}`}
              </p>

              <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                <span className={`text-xs font-bold ${item.active ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {item.active ? 'Active' : 'Disabled'}
                </span>
                {canManage && (
                  <button onClick={() => onToggle(item.id)} className="text-xs font-black text-teal-700 hover:underline">
                    {item.active ? 'Disable' : 'Enable'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface DoctorFormValues {
  name: string;
  specialization: string;
  bio: string;
  image: string;
  title: string;
  qualification: string;
  active: boolean;
}
interface ServiceFormValues {
  name: string;
  description: string;
  durationMinutes: number;
  price: number | null;
  active: boolean;
}

function ManagementEditor({
  kind,
  item,
  onClose,
  onSave,
}: {
  kind: 'doctor' | 'service';
  item?: DoctorRecord | ServiceRecord;
  onClose: () => void;
  onSave: (values: DoctorFormValues | ServiceFormValues) => Promise<boolean>;
}) {
  const doctor = kind === 'doctor' && item && 'specialization' in item ? item : undefined;
  const service = kind === 'service' && item && !('specialization' in item) ? item : undefined;
  const [name, setName] = useState(doctor?.name || service?.name || '');
  const [specialization, setSpecialization] = useState(doctor?.specialization || '');
  const [bio, setBio] = useState(doctor?.bio || '');
  const [image, setImage] = useState(doctor?.image || '');
  const [title, setTitle] = useState(doctor?.title || '');
  const [qualification, setQualification] = useState(doctor?.qualification || '');
  const [description, setDescription] = useState(service?.description || '');
  const [durationMinutes, setDurationMinutes] = useState(service ? parseInt(service.duration, 10) || 30 : 30);
  const [price, setPrice] = useState(service?.price?.replace(/^NPR\s*/i, '') || '');
  const [active, setActive] = useState(item?.active ?? true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    if (!name.trim()) { setError('Name is required.'); return; }
    if (kind === 'service' && (!Number.isInteger(durationMinutes) || durationMinutes < 5 || durationMinutes > 480)) {
      setError('Duration must be between 5 and 480 minutes.'); return;
    }
    setSaving(true);
    const ok = kind === 'doctor'
      ? await onSave({ name, specialization, bio, image, title, qualification, active })
      : await onSave({ name, description, durationMinutes, price: price.trim() === '' ? null : Number(price), active });
    setSaving(false);
    if (!ok) setError('Could not save. Check your permissions and database configuration.');
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4" role="dialog" aria-modal="true" aria-labelledby="management-editor-title">
      <form onSubmit={submit} className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-teal-600">Admin catalog</p>
            <h2 id="management-editor-title" className="mt-1 text-2xl font-black">{item ? 'Edit' : 'Add'} {kind}</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-xl px-3 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100">Close</button>
        </div>

        <div className="mt-6 space-y-4">
          <label className="block text-sm font-bold">Name
            <input value={name} onChange={(e) => setName(e.target.value)} required maxLength={120} className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-teal-500" />
          </label>

          {kind === 'doctor' ? (
            <>
              <label className="block text-sm font-bold">Specialization
                <input value={specialization} onChange={(e) => setSpecialization(e.target.value)} maxLength={120} className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-teal-500" />
              </label>
              <label className="block text-sm font-bold">Display title
                <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} placeholder="e.g. Dentist / Orthodontist" className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-teal-500" />
              </label>
              <label className="block text-sm font-bold">Qualification
                <input value={qualification} onChange={(e) => setQualification(e.target.value)} maxLength={160} placeholder="Only enter clinic-verified qualification" className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-teal-500" />
              </label>
              <label className="block text-sm font-bold">Bio
                <textarea value={bio} onChange={(e) => setBio(e.target.value)} maxLength={1000} rows={4} className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-teal-500" />
              </label>
              <label className="block text-sm font-bold">Image URL
                <input type="url" value={image} onChange={(e) => setImage(e.target.value)} maxLength={1000} className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-teal-500" />
              </label>
            </>
          ) : (
            <>
              <label className="block text-sm font-bold">Description
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} maxLength={1000} rows={4} className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-teal-500" />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block text-sm font-bold">Duration (minutes)
                  <input type="number" min={5} max={480} step={1} value={durationMinutes} onChange={(e) => setDurationMinutes(Number(e.target.value))} className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-teal-500" />
                </label>
                <label className="block text-sm font-bold">Price (NPR)
                  <input type="number" min={0} step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-teal-500" />
                </label>
              </div>
            </>
          )}

          <label className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 text-sm font-bold">
            <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="h-4 w-4" />
            Active and bookable
          </label>

          {error && <p role="alert" className="text-sm font-semibold text-rose-700">{error}</p>}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold">Cancel</button>
          <button type="submit" disabled={saving} className="rounded-xl bg-teal-600 px-5 py-3 text-sm font-black text-white disabled:opacity-50">
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </form>
    </div>
  );
}

function AuditLogsTab({ logs, userRole }: { logs: AuditLogRecord[]; userRole: string }) {
  if (userRole === 'doctor') {
    return (
      <div className="p-8 rounded-2xl bg-white border border-slate-200 text-center text-sm font-semibold text-slate-600">
        <Shield className="mx-auto mb-2 text-slate-400" size={32} />
        Audit log access is restricted to Admin and Receptionist personnel.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black">Audit History</h2>
        <p className="mt-1 text-sm text-slate-500">Administrative and booking actions recorded server-side.</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="divide-y divide-slate-100">
          {logs.map((log) => (
            <div key={log.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm">
              <div className="flex items-start gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-slate-100 text-slate-700 shrink-0">
                  <FileText size={18} />
                </div>
                <div>
                  <p className="font-bold text-slate-900">{log.action}</p>
                  <p className="text-xs text-slate-500">
                    Actor: <span className="font-semibold text-slate-700">{log.actor_role}</span> • Appointment ID:{' '}
                    {log.appointment_id || 'N/A'}
                  </p>
                </div>
              </div>

              <div className="text-right sm:text-right">
                <span className="text-xs text-slate-400">
                  {new Date(log.created_at).toLocaleString()}
                </span>
              </div>
            </div>
          ))}

          {logs.length === 0 && (
            <div className="p-8 text-center text-sm font-semibold text-slate-500">
              No audit log entries recorded yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SettingsPanel({ user }: { user: UserProfile }) {
  const isSupabase = isSupabaseConfigured;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black">Clinic Configuration & System Health</h2>
        <p className="mt-1 text-sm text-slate-500">Read-only configuration settings and environment guardrails.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
          <h3 className="font-black text-slate-900">Clinic Identity</h3>
          <Field label="Clinic Name" value={clinicConfig.name} />
          <Field label="Address" value={clinicConfig.address} />
          <Field label="Contact Phone" value={clinicConfig.phone} />
          <Field label="WhatsApp Contact" value={clinicConfig.whatsapp} />
          <Field label="Timezone" value={clinicConfig.timezone || 'Asia/Kathmandu'} />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
          <h3 className="font-black text-slate-900">Security & Backend Evaluation</h3>
          <div className="space-y-3 text-xs">
            <CheckItem label="Supabase Auth persistence" status={isSupabase} badgeText={isSupabase ? 'ACTIVE' : 'SANDBOX'} />
            <CheckItem label="PostgreSQL RLS Scoping (clinic_id)" status={isSupabase} badgeText={isSupabase ? "CONFIGURED — VERIFY IN DB" : "NOT CONFIGURED"} />
            <CheckItem label="Interval Overlap Protection" status={isSupabase} badgeText={isSupabase ? "DB ENFORCED" : "NOT CONFIGURED"} />
            <CheckItem label="Server-Side Validation" status={isSupabase} badgeText={isSupabase ? "CONFIGURED" : "NOT CONFIGURED"} />
            <CheckItem label="Audit Logging" status={isSupabase} badgeText={isSupabase ? "CONFIGURED" : "NOT CONFIGURED"} />
            <CheckItem label="Active User Session" status={Boolean(user)} badgeText={user ? `ROLE: ${user.role.toUpperCase()}` : 'NONE'} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
      {label}
      <input
        readOnly
        value={value}
        className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-800 outline-none"
      />
    </label>
  );
}

function CheckItem({ label, status, badgeText }: { label: string; status: boolean; badgeText: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
      <span className="font-semibold text-slate-700">{label}</span>
      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${status ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
        {badgeText}
      </span>
    </div>
  );
}
