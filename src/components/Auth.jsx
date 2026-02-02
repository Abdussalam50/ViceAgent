import * as React from 'react';
import { Lock, Mail, Loader2, User, ChevronDown } from 'lucide-react';
import { supabase } from '../api/supabase';
import BrandIcon from './BrandIcon';
import { useLanguage } from '../context/LanguageContext';

export default function Auth() {
    const { t } = useLanguage()
    const [loading, setLoading] = React.useState(false)
    const [email, setEmail] = React.useState('')
    const [password, setPassword] = React.useState('')
    const [isLogin, setIsLogin] = React.useState(true)
    const [error, setError] = React.useState(null)
    const [message, setMessage] = React.useState(null)

    // State tambahan untuk registrasi
    const [gender, setGender] = React.useState('')
    const [devLevel, setDevLevel] = React.useState('')

    const handleAuth = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setMessage(null)

        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                })
                if (error) throw error
            } else {
                // Sign Up dengan Metadata tambahan
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            gender: gender,
                            developer_level: devLevel,
                            is_pro: false // Otomatis FREE saat daftar
                        }
                    }
                })
                if (error) throw error
                setMessage('Check your email for the confirmation link!')
            }
        } catch (error) {
            setError(error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-950 p-4">
            <div className="w-full max-w-md space-y-8 rounded-2xl bg-slate-900 p-8 shadow-xl border border-slate-800">
                <div className="text-center">
                    <div className="flex justify-center mb-6">
                        <BrandIcon size={64} className="drop-shadow-2xl" />
                    </div>
                    <h2 className="mt-2 text-3xl font-bold tracking-tight text-white">
                        {isLogin ? t('auth_welcome') : t('auth_create_account')}
                    </h2>
                    <p className="mt-2 text-sm text-slate-400">
                        {isLogin ? t('auth_welcome_sub') : t('auth_create_account_sub')}
                    </p>
                </div>

                <form className="mt-8 space-y-5" onSubmit={handleAuth}>
                    <div className="space-y-4">
                        {/* Input Email */}
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="block w-full rounded-lg border border-slate-700 bg-slate-800 py-3 pl-10 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                                placeholder={t('auth_email')}
                            />
                        </div>

                        {/* Input Password */}
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="block w-full rounded-lg border border-slate-700 bg-slate-800 py-3 pl-10 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                                placeholder={t('auth_password')}
                            />
                        </div>

                        {/* Input Tambahan (Hanya muncul saat Sign Up) */}
                        {!isLogin && (
                            <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                <div className="relative">
                                    <select
                                        required
                                        value={gender}
                                        onChange={(e) => setGender(e.target.value)}
                                        className="block w-full appearance-none rounded-lg border border-slate-700 bg-slate-800 py-3 px-4 text-white focus:border-blue-500 focus:outline-none sm:text-sm"
                                    >
                                        <option value="" disabled>{t('auth_gender')}</option>
                                        <option value="male">{t('auth_male')}</option>
                                        <option value="female">{t('auth_female')}</option>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-3.5 h-4 w-4 text-slate-500 pointer-events-none" />
                                </div>
                                <div className="relative">
                                    <select
                                        required
                                        value={devLevel}
                                        onChange={(e) => setDevLevel(e.target.value)}
                                        className="block w-full appearance-none rounded-lg border border-slate-700 bg-slate-800 py-3 px-4 text-white focus:border-blue-500 focus:outline-none sm:text-sm"
                                    >
                                        <option value="" disabled>Developer Level</option>
                                        <option value="junior">{t('auth_junior')}</option>
                                        <option value="middle">{t('auth_middle')}</option>
                                        <option value="senior">{t('auth_senior')}</option>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-3.5 h-4 w-4 text-slate-500 pointer-events-none" />
                                </div>
                            </div>
                        )}
                    </div>

                    {error && (
                        <div className="rounded-md bg-red-900/30 p-3 border border-red-900/50">
                            <p className="text-xs text-red-400 text-center">{error}</p>
                        </div>
                    )}

                    {message && (
                        <div className="rounded-md bg-green-900/30 p-3 border border-green-900/50">
                            <p className="text-xs text-green-400 text-center">{message}</p>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="flex w-full justify-center rounded-lg bg-blue-600 px-4 py-3 text-sm font-bold text-white hover:bg-blue-500 disabled:opacity-50 transition-all shadow-lg shadow-blue-900/20"
                    >
                        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (isLogin ? t('auth_sign_in') : t('auth_create_acc'))}
                    </button>
                </form>

                <div className="text-center">
                    <button
                        type="button"
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
                    >
                        {isLogin ? t('auth_no_account') : t('auth_have_account')}
                    </button>
                </div>
            </div>
        </div>
    )
}