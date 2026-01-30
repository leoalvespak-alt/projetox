'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/utils/supabase/client'
import { Search, ShieldCheck, FileCheck, ArrowRight } from 'lucide-react'

export default function Home() {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [institutionName, setInstitutionName] = useState('Veritas Uninassau')
  const [isFocused, setIsFocused] = useState(false)

  useEffect(() => {
    async function fetchSettings() {
      const { data } = await supabase.from('site_settings').select('logo_url, institution_name').single()
      if (data?.logo_url) setLogoUrl(data.logo_url)
      if (data?.institution_name) setInstitutionName(data.institution_name)
    }
    fetchSettings()
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (code.trim()) {
      router.push(`/verify/${code.trim()}`)
    }
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-navy-deep text-white overflow-hidden selection:bg-gold selection:text-navy-deep">
      
      {/* Background Watermark/Pattern */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden select-none flex items-center justify-center">
         <h1 className="text-[20vw] font-bold text-white/5 font-serif tracking-widest whitespace-nowrap uppercase">
            {institutionName.split(' ')[0]}
         </h1>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-gold to-transparent opacity-50"></div>
      <div className="absolute bottom-0 left-0 w-full h-32 bg-linear-to-t from-navy-deep/80 to-transparent pointer-events-none"></div>

      {/* Navigation / Top Bar */}
      <nav className="absolute top-0 w-full p-8 z-20 flex justify-between items-center">
        <div className="flex items-center gap-4">
           {logoUrl ? (
             // eslint-disable-next-line @next/next/no-img-element
             <img src={logoUrl} alt={institutionName} className="h-12 object-contain brightness-0 invert opacity-90" />
           ) : (
             <div className="w-10 h-10 border border-gold/50 flex items-center justify-center text-gold font-serif font-bold">
               {institutionName.charAt(0)}
             </div>
           )}
           <div className="hidden md:block h-8 w-px bg-white/10 mx-2"></div>
           <span className="hidden md:block text-xs uppercase tracking-[0.2em] text-white/60">{institutionName}</span>
        </div>
        
        <a href="/login" className="group flex items-center gap-2 text-sm font-medium text-gold hover:text-gold/80 transition-all">
          <span className="uppercase tracking-widest text-xs group-hover:underline decoration-gold underline-offset-4">Acesso Restrito</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </a>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 w-full max-w-4xl px-4 flex flex-col items-center text-center animate-fade-in">
        
        <div className="mb-8 md:mb-12 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gold/30 bg-gold/5 text-gold text-[10px] md:text-xs uppercase tracking-widest font-bold mb-2 md:mb-4">
                <ShieldCheck className="w-3 h-3" /> Sistema Oficial
            </div>
            <h1 className="text-4xl md:text-7xl font-serif font-bold text-white tracking-tight leading-tight">
                Validação de <br/><span className="text-transparent bg-clip-text bg-linear-to-r from-gold to-gold/70">Diplomas Digitais</span>
            </h1>
            <p className="max-w-xl mx-auto text-sm md:text-lg text-blue-100/60 font-light leading-relaxed px-4">
                Garanta a autenticidade e integridade dos documentos acadêmicos emitidos pela instituição através do nosso sistema de verificação em tempo real.
            </p>
        </div>

        <form onSubmit={handleSearch} className="w-full max-w-lg relative group">
            <div className={`absolute inset-0 bg-gold opacity-0 blur-xl transition-opacity duration-700 ${isFocused ? 'opacity-20' : ''}`}></div>
            
            <div className="relative flex flex-col sm:flex-row items-center gap-2 sm:gap-0 animate-slide-up delay-100">
                <div className="hidden sm:block absolute left-6 text-gold z-10">
                    <Search className="w-6 h-6" />
                </div>
                <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder="Digite o código (UUID)"
                    className="w-full bg-white/5 border border-white/10 text-white placeholder:text-white/30 text-base md:text-lg py-4 md:py-5 pl-4 sm:pl-16 pr-4 sm:pr-32 focus:bg-white/10 focus:border-gold outline-none transition-all duration-300 font-mono tracking-wide rounded-none backdrop-blur-sm shadow-2xl text-center sm:text-left"
                />
                <button 
                    type="submit"
                    className="w-full sm:w-auto sm:absolute sm:right-2 bg-gold text-navy-deep hover:bg-gold/90 px-6 py-3.5 sm:py-2.5 font-bold uppercase tracking-wide text-sm transition-all active:scale-[0.98] shadow-lg sm:shadow-none mt-2 sm:mt-0"
                >
                    Validar
                </button>
            </div>
            
            <div className="mt-6 sm:mt-4 flex items-center justify-center gap-4 sm:gap-6 text-[10px] md:text-xs text-white/40 uppercase tracking-wider animate-slide-up delay-200">
               <span className="flex items-center gap-2">
                  <FileCheck className="w-3 h-3 text-gold" /> Hash SHA-256
               </span>
               <span className="w-1 h-1 rounded-full bg-white/20"></span>
               <span>Base Oficial</span>
            </div>
        </form>

      </main>

      {/* Footer Branding */}
      <div className="absolute bottom-8 text-center w-full z-10 opacity-40">
         <p className="text-[10px] uppercase tracking-[0.3em] text-white">
            Powered by Veritas Security
         </p>
      </div>

    </div>
  )
}
