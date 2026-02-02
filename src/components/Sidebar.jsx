import * as React from 'react';
import { LayoutDashboard, Laptop, FileText, Activity, LogOut, Zap, Globe } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { supabase } from '../api/supabase';
import UpgradeModal from './UpgradeModal';
import BrandIcon from './BrandIcon';
import { useLanguage } from '../context/LanguageContext';

const Sidebar = ({ profile }) => {
    const { lang, setLang, t } = useLanguage();
    const [isUpgradeOpen, setIsUpgradeOpen] = React.useState(false);

    const getLinkClass = ({ isActive }) =>
        isActive ? 'sidebar-link-active' : 'sidebar-link';

    return (
        <>
            <aside className="w-72 bg-slate-950 text-white flex flex-col border-r border-slate-800">
                <div className="p-8">
                    <div className="flex items-center justify-between mb-10">
                        <div className="flex items-center gap-3">
                            <BrandIcon size={40} className="drop-shadow-xl" />
                            <span className="text-2xl font-black tracking-tighter text-white">{t('brand_name')}</span>
                        </div>

                        {/* Language Switcher Small Button */}
                        <button
                            onClick={() => setLang(lang === 'en' ? 'id' : 'en')}
                            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-all active:scale-95"
                            title={t('switch_lang_tip')}
                        >
                            <Globe size={16} />
                        </button>
                    </div>

                    <nav className="space-y-2">
                        <NavLink to="/" end className={getLinkClass}>
                            <LayoutDashboard size={20} /> <span>{t('nav_overview')}</span>
                        </NavLink>
                        <NavLink to="/devices" className={getLinkClass}>
                            <Laptop size={20} /> <span>{t('nav_projects')}</span>
                        </NavLink>
                        <NavLink to="/reports" className={getLinkClass}>
                            <FileText size={20} /> <span>{t('nav_reports')}</span>
                        </NavLink>
                    </nav>
                </div>

                <div className="flex-1"></div>

                <div className="p-8 border-t border-slate-900 bg-slate-900/50">
                    {profile && (
                        <div className="mb-6 p-4 rounded-2xl border border-slate-800 bg-slate-950 shadow-sm transition-all hover:border-slate-700">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('plan_type')}</span>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-black ${profile.is_pro ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                                    {profile.is_pro ? t('plan_pro') : t('plan_free')}
                                </span>
                            </div>

                            <div className="space-y-1">
                                <div className="flex justify-between text-[11px] font-bold">
                                    <span className="text-slate-400">{t('daily_ai_quota')}</span>
                                    <span className="text-white">{profile.ai_usage_count || 0} / {profile.is_pro ? 50 : 10}</span>
                                </div>
                                <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-500 ${profile.is_pro ? 'bg-indigo-500' : 'bg-blue-500'}`}
                                        style={{ width: `${Math.min(100, ((profile.ai_usage_count || 0) / (profile.is_pro ? 50 : 10)) * 100)}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* Tombol Upgrade - Hanya muncul jika bukan user PRO */}
                            {!profile.is_pro && (
                                <button
                                    onClick={() => setIsUpgradeOpen(true)}
                                    className="mt-4 w-full flex items-center justify-center gap-2 bg-indigo-600/10 border border-indigo-500/20 hover:bg-indigo-600 py-2 rounded-xl text-[11px] font-black text-indigo-400 hover:text-white transition-all group"
                                >
                                    <Zap size={14} className="fill-current group-hover:animate-pulse" />
                                    {t('upgrade_pro')}
                                </button>
                            )}
                        </div>
                    )}

                    <button
                        onClick={() => supabase.auth.signOut()}
                        className="flex items-center gap-3 w-full px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors group"
                    >
                        <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
                        <span className="font-bold">{t('sign_out')}</span>
                    </button>
                </div>
            </aside>

            {/* Render Modal */}
            <UpgradeModal
                isOpen={isUpgradeOpen}
                onClose={() => setIsUpgradeOpen(false)}
                userEmail={profile?.email}
                profileId={profile?.id}
            />
        </>
    );
};

export default Sidebar;