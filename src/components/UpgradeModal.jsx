import React, { useState } from 'react';
import { Check, X, Star, Zap, Shield, Sparkles, Loader2 } from 'lucide-react';
import { supabase } from '../api/supabase';
import BrandIcon from './BrandIcon';
import { useLanguage } from '../context/LanguageContext';

export default function UpgradeModal({ isOpen, onClose, userEmail, profileId }) {
    const { t } = useLanguage();
    const [loading, setLoading] = useState(false);

    const handleUpgrade = async () => {
        setLoading(true);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ is_pro: true })
                .eq('id', profileId);

            if (error) throw error;
            onClose();
        } catch (err) {
            console.error("Upgrade failed:", err);
            alert("Upgrade failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative w-full max-w-xl bg-white rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 transition-colors z-10"
                >
                    <X size={24} className="text-slate-400" />
                </button>

                <div className="grid grid-cols-1 md:grid-cols-2">
                    {/* Left Side: Promo Content */}
                    <div className="bg-indigo-600 p-8 md:p-12 text-white">
                        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
                            <BrandIcon size={48} className="drop-shadow-lg" />
                        </div>
                        <h2 className="text-3xl font-black leading-tight mb-4">
                            {t('upgrade_top_title')}
                        </h2>
                        <p className="text-indigo-100 text-sm font-medium leading-relaxed mb-8">
                            {t('upgrade_top_sub')}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                            {[
                                { icon: <Zap size={18} />, text: t('feature_1'), color: "text-amber-400" },
                                { icon: <Sparkles size={18} />, text: t('feature_2'), color: "text-purple-400" },
                                { icon: <Shield size={18} />, text: t('feature_3'), color: "text-blue-400" },
                                { icon: <Star size={18} />, text: t('feature_4'), color: "text-indigo-400" },
                            ].map((feature, idx) => (
                                <div key={idx} className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${feature.color}/20`}>
                                        {feature.icon}
                                    </div>
                                    <span className="text-sm font-bold">{feature.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Side: Action */}
                    <div className="p-8 md:p-12 flex flex-col justify-center bg-white">
                        <div className="mb-8">
                            <h2 className="text-3xl font-black text-slate-900 tracking-tight">{t('upgrade_title')}</h2>
                            <p className="text-slate-500 font-bold mt-2">{t('upgrade_subtitle')}</p>
                        </div>

                        <div className="space-y-6">
                            <div className="p-6 rounded-3xl border-2 border-indigo-600 bg-indigo-50/50">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-indigo-600 text-xs font-black uppercase tracking-tighter">{t('premium_plan_label')}</span>
                                    <span className="text-slate-900 font-bold">$4/{t('upgrade_forever')}</span>
                                </div>
                                <p className="text-slate-600 text-[10px] font-medium leading-relaxed">
                                    {t('premium_plan_description')}
                                </p>
                            </div>

                            <button
                                onClick={handleUpgrade}
                                disabled={loading}
                                className="w-full bg-slate-950 hover:bg-slate-900 text-white font-black py-4 rounded-3xl transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="animate-spin" size={20} /> : (
                                    <>
                                        <span>{t('upgrade_btn')}</span>
                                        <Sparkles size={18} className="text-amber-400 animate-pulse" />
                                    </>
                                )}
                            </button>

                            <p className="text-center text-[10px] text-slate-400 font-medium">
                                {t('no_credit_card_required')} <br />
                                {t('linked_to')}: <span className="text-slate-600">{userEmail || 'User'}</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}