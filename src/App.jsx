import * as React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { supabase } from './api/supabase';
import Sidebar from './components/Sidebar';
import Auth from './components/Auth';
import DashboardHome from './components/DashboardHome';
import DeviceList from './components/DeviceList';
import AnalysisReport from './components/AnalysisReport';
import { useLanguage } from './context/LanguageContext';

const Layout = ({ profile }) => {
  const { t } = useLanguage();
  const location = useLocation();
  const getTitle = () => {
    switch (location.pathname) {
      case '/devices': return t('nav_projects');
      case '/reports': return t('nav_reports');
      default: return t('nav_overview');
    }
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar profile={profile} />
      <main className="flex-1 bg-gray-50 overflow-y-auto p-12">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight capitalize">{getTitle()}</h2>
            <p className="text-slate-500 mt-1 font-medium">{t('overview_subtitle')}</p>
          </div>
          <div className="flex items-center gap-4">
            {profile && (
              <div className={`px-4 py-2 rounded-full font-bold text-sm shadow-sm border ${profile.is_pro ? 'bg-indigo-600 text-white border-indigo-400' : 'bg-white text-slate-600 border-slate-200'
                }`}>
                {profile.is_pro ? '🚀 PRO' : '🌱 FREE'}
              </div>
            )}
            <div className="badge-online text-green-600 bg-green-50 px-4 py-2 rounded-full font-bold flex items-center gap-2">
              <span className="h-2 w-2 bg-green-500 rounded-full animate-ping"></span>
              {t('server_active')}
            </div>
          </div>
        </header>
        <Outlet context={{ profile }} />
      </main>
    </div>
  )
}

function App() {
  const [session, setSession] = React.useState(null)
  const [profile, setProfile] = React.useState(null)
  const [loading, setLoading] = React.useState(true)
  const [devices, setDevices] = React.useState([])
  const [reports, setReports] = React.useState([])

  // Auth listener
  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (!session) setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (!session) {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // Data fetching
  const fetchData = async () => {
    // Ambil data Devices
    const { data: devicesData } = await supabase.from('agent_configs').select('*')
    // Ambil data Reports untuk statistik di Dashboard
    const { data: reportsData } = await supabase
      .from('scan_reports')
      .select('*, project:agent_configs(device_name, project_name)')
      .order('created_at', { ascending: false })
      .limit(100)

    if (devicesData) setDevices(devicesData)
    if (reportsData) setReports(reportsData)
  }

  const fetchProfile = async (userId) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code === 'PGRST116') {
        // Profile not found, create one
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert([{ id: userId, is_pro: false, ai_quota_limit: 10 }])
          .select()
          .single();
        if (!createError) setProfile(newProfile);
      } else if (data) {
        setProfile(data);
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    if (session) {
      fetchData()
      fetchProfile(session.user.id)
    }
  }, [session])

  const handleUpdateDevice = async (deviceId, updates) => {
    try {
      const { error } = await supabase
        .from('agent_configs')
        .update(updates)
        .eq('id', deviceId)

      if (error) throw error

      // Update local state
      setDevices(prev => prev.map(d => d.id === deviceId ? { ...d, ...updates } : d))
      console.log(`✅ Device ${deviceId} updated:`, updates)
    } catch (err) {
      console.error("❌ Failed to update device:", err)
      alert("Failed to update device status.")
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white font-bold">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin"></div>
          <p className="text-sm text-slate-400">Memuat ArchiTech...</p>
        </div>
      </div>
    )
  }

  return (
    <Router>
      <Routes>
        {/* Route untuk login - TIDAK ADA Layout di sini */}
        <Route path="/login" element={
          !session ? <Auth /> : <Navigate to="/" replace />
        } />

        {/* Route yang dilindungi (protected routes) */}
        <Route element={session ? <Layout profile={profile} /> : <Navigate to="/login" replace />}>
          <Route index element={
            <DashboardHome
              devices={devices}
              reports={reports}
              profile={profile}
              onUpdateDevice={handleUpdateDevice}
            />
          } />
          <Route path="devices" element={
            <DeviceList
              devices={devices}
              profile={profile}
              onRefresh={fetchData}
              onUpdateDevice={handleUpdateDevice}
            />
          } />
          <Route path="reports" element={<AnalysisReport />} />
        </Route>

        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App