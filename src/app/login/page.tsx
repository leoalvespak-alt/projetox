'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/utils/supabase/client'
import { Loader2, Lock, User, ArrowRight, Shield } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [logoUrl, setLogoUrl] = useState<string | null>(null)

  useEffect(() => {
    async function fetchSettings() {
      const { data } = await supabase.from('site_settings').select('logo_url').single()
      if (data?.logo_url) setLogoUrl(data.logo_url)
    }
    fetchSettings()
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError('Credenciais inválidas. Verifique seu acesso.')
      setLoading(false)
    } else {
      router.push('/portal')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#002B49] text-white overflow-hidden relative selection:bg-[#C5A059] selection:text-[#002B49]">
      
      {/* Background Elements */}
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-[#C5A059] to-transparent opacity-30"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#003B64] to-[#002B49] opacity-50 z-0"></div>
      
       {/* Watermark */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 opacity-[0.02]">
        <h1 className="text-[30vw] font-serif font-bold tracking-widest text-white whitespace-nowrap">
            LOGIN
        </h1>
      </div>

      <div className="w-full max-w-md p-4 sm:p-8 relative z-10 animate-fade-in">
        
        {/* Header */}
        <div className="text-center mb-8 sm:mb-10 space-y-2">
             <div className="flex justify-center mb-6">
                {logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={logoUrl} alt="Logo Institucional" className="h-10 sm:h-14 object-contain brightness-0 invert opacity-90" />
                ) : (
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-[#C5A059] flex items-center justify-center text-[#C5A059]">
                       <Shield className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                )}
             </div>
             <h2 className="text-xl sm:text-2xl font-serif font-bold tracking-wide text-white">Portal do Aluno</h2>
             <p className="text-xs sm:text-sm text-blue-200/60 uppercase tracking-widest font-medium">Acesso Restrito</p>
        </div>

        {/* Glass Card Form */}
        <div className="bg-white/[0.03] backdrop-blur-md border border-white/10 p-6 sm:p-8 rounded-none shadow-2xl relative">
            
            {/* Corner Accents */}
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#C5A059]"></div>
            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[#C5A059]"></div>
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-[#C5A059]"></div>
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#C5A059]"></div>

            <form onSubmit={handleLogin} className="space-y-5 sm:space-y-6">
                <div className="space-y-2">
                    <label className="text-[10px] sm:text-xs font-bold text-[#C5A059] uppercase tracking-wider pl-1" htmlFor="email">Identificação</label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors group-focus-within:text-[#C5A059]">
                            <User className="h-4 w-4 text-white/40" />
                        </div>
                        <input
                            id="email"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="block w-full bg-black/20 border border-white/10 text-white placeholder-white/20 pl-10 py-3 focus:outline-none focus:border-[#C5A059] focus:bg-black/40 transition-all font-light text-base"
                            placeholder="Email Institucional"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                     <div className="flex items-center justify-between pl-1">
                        <label className="text-[10px] sm:text-xs font-bold text-[#C5A059] uppercase tracking-wider" htmlFor="password">Credencial</label>
                        <a href="#" className="text-[10px] text-white/40 hover:text-white transition-colors uppercase tracking-widest">Esqueceu?</a>
                    </div>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors group-focus-within:text-[#C5A059]">
                            <Lock className="h-4 w-4 text-white/40" />
                        </div>
                        <input
                            id="password"
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="block w-full bg-black/20 border border-white/10 text-white placeholder-white/20 pl-10 py-3 focus:outline-none focus:border-[#C5A059] focus:bg-black/40 transition-all font-light text-base"
                            placeholder="Senha de Acesso"
                        />
                    </div>
                </div>

                {error && (
                    <div className="p-3 bg-red-900/30 border border-red-500/30 text-red-200 text-xs flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 bg-[#C5A059] text-[#002B49] py-3.5 px-4 font-bold text-sm uppercase tracking-widest hover:bg-[#D4AF37] focus:ring-2 focus:ring-[#C5A059]/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4 group active:scale-[0.98]"
                >
                    {loading ? (
                         <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <>
                            Entrar <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                </button>
            </form>
        </div>

        <div className="text-center mt-8">
             <p className="text-[10px] text-white/30 uppercase tracking-[0.2em]">Ambiente Seguro &bull; Criptografia Ponta-a-Ponta</p>
        </div>

      </div>
    </div>
  )
}
