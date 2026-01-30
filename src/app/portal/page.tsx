'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/utils/supabase/client'
import { Loader2, Download, LogOut, GraduationCap, FileCheck, ShieldCheck, Calendar, BookOpen, Clock } from 'lucide-react'
import QRCode from 'react-qr-code'

interface Profile {
  full_name: string
  course_name: string
  registration_number: string
  diploma_url: string
  validation_code: string
  enrollment_status: string
  academic_period: string
  average_grade: string
  mandatory_hours_pct: string
  complementary_hours_pct: string
  registration_book: string
  issue_date: string
}

export default function StudentPortal() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [institutionName, setInstitutionName] = useState('Veritas Uninassau')
  // Stable random number for the session
  const [randomBookId] = useState(() => Math.floor(Math.random() * 1000))

  useEffect(() => {
    async function checkUser() {
      // Get Settings
      const { data: settings } = await supabase.from('site_settings').select('logo_url, institution_name').single()
      if (settings?.logo_url) setLogoUrl(settings.logo_url)
      if (settings?.institution_name) setInstitutionName(settings.institution_name)

      // Get User
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // Get Profile
      const { data } = await supabase
        .from('diploma_students')
        .select('*')
        .eq('id', user.id)
        .single()

      if (data) {
        setProfile(data)
      }
      setLoading(false)
    }
    checkUser()
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-navy-deep">
        <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-gold" />
            <p className="text-gold font-medium animate-pulse tracking-widest uppercase text-xs">Carregando Portal...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-navy-deep font-sans text-white selection:bg-gold selection:text-navy-deep">
      
      {/* Background Decor */}
      <div className="fixed inset-0 bg-linear-to-br from-navy-deep/80 via-navy-deep to-navy-deep opacity-60 pointer-events-none"></div>

      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-navy-deep/80 backdrop-blur-md border-b border-white/5 safe-top">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            <div className="flex items-center gap-3">
               {logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={logoUrl} alt={institutionName} className="h-8 md:h-10 brightness-0 invert opacity-90 object-contain" />
                ) : (
                    <div className="p-1.5 md:p-2 border border-gold/30 rounded-lg">
                        <GraduationCap className="h-5 w-5 md:h-6 md:w-6 text-gold" />
                    </div>
                )}
              <div className="hidden md:block">
                <span className="block text-lg font-bold tracking-tight text-white">{institutionName}</span>
                <span className="block text-[10px] uppercase tracking-widest text-gold font-bold">Portal do Aluno</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 md:gap-3 px-2 py-1 md:px-4 md:py-2 bg-white/5 rounded-full border border-white/5">
                    <div className="h-7 w-7 md:h-8 md:w-8 rounded-full bg-gold flex items-center justify-center text-navy-deep text-xs md:text-sm font-bold shadow-lg shadow-gold/20">
                        {profile?.full_name?.charAt(0) || 'A'}
                    </div>
                    <span className="text-sm font-medium hidden sm:block pr-2 text-white/80">Olá, {profile?.full_name?.split(' ')[0]}</span>
                </div>
                <button 
                    onClick={handleLogout}
                    className="p-2 md:p-2.5 text-white/50 hover:text-white transition-colors rounded-full hover:bg-white/10 active:bg-white/20"
                    title="Sair do Portal"
                >
                    <LogOut className="h-5 w-5" />
                </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="relative container mx-auto px-4 py-8 md:py-12 sm:px-6 lg:px-8 pb-20">
        {/* Welcome Section */}
        <div className="mb-8 md:mb-12 animate-fade-in">
            <h1 className="text-2xl md:text-4xl font-bold text-white font-serif tracking-tight">
                Painel Acadêmico
            </h1>
            <p className="mt-1 md:mt-2 text-sm md:text-base text-white/60">
                Curso Superior em <span className="font-semibold text-[#C5A059]">{profile?.course_name}</span>
            </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
            {/* Left Column - Main Content (Diploma & Validation) */}
            <div className="lg:col-span-2 space-y-6 md:space-y-8">
                {/* Diploma Card */}
                <div className="bg-white/3 backdrop-blur-sm rounded-none border border-white/10 overflow-hidden animate-slide-up delay-100 group active:border-gold/30 transition-colors">
                     <div className="bg-linear-to-r from-gold/10 to-transparent px-5 py-4 md:px-8 md:py-6 flex justify-between items-center border-b border-white/5">
                        <div className="flex items-center gap-3 md:gap-4">
                             <div className="p-2 md:p-2.5 bg-gold/20 rounded-lg text-gold">
                                <FileCheck className="h-5 w-5 md:h-6 md:w-6" />
                             </div>
                             <div>
                                 <h2 className="text-base md:text-lg font-bold text-white">Diploma Digital</h2>
                                 <p className="text-[10px] md:text-xs text-gold uppercase tracking-wide font-bold">Documento Oficial</p>
                             </div>
                        </div>
                        <span className="hidden sm:inline-flex px-3 py-1 bg-green-500/10 text-green-400 text-[10px] font-bold uppercase tracking-wider rounded-full border border-green-500/20 items-center gap-1">
                            <ShieldCheck className="w-3 h-3" /> Autenticado
                        </span>
                     </div>
                     
                     <div className="p-5 md:p-8">
                        <div className="flex flex-col sm:flex-row gap-6 md:gap-8 items-center">
                            <div className="flex-1 space-y-4 md:space-y-6">
                                <p className="text-white/70 leading-relaxed text-sm font-light">
                                    Seu diploma de conclusão de curso foi emitido e assinado digitalmente. Este documento possui validade jurídica nacional.
                                </p>
                                
                                 <div className="grid grid-cols-2 gap-4 md:gap-6 text-sm">
                                      <div>
                                         <p className="text-white/30 text-[10px] uppercase font-bold tracking-widest mb-1">Emissão</p>
                                         <p className="font-mono text-white/90 text-xs md:text-sm">{profile?.issue_date || new Date().toLocaleDateString('pt-BR')}</p>
                                      </div>
                                      <div>
                                         <p className="text-white/30 text-[10px] uppercase font-bold tracking-widest mb-1">Livro de Registro</p>
                                         <p className="font-mono text-white/90 text-xs md:text-sm">{profile?.registration_book || `LB-2024/${randomBookId}`}</p>
                                      </div>
                                 </div>

                            </div>
                            
                             <div className="shrink-0 w-full sm:w-auto">
                                <a 
                                    href={profile?.diploma_url}
                                    download
                                    target="_blank"
                                    className="group/btn flex sm:flex-col flex-row items-center justify-center gap-3 p-4 md:p-6 rounded-xl border border-dashed border-white/20 hover:border-gold hover:bg-gold/5 active:bg-gold/10 transition-all cursor-pointer w-full sm:w-48 text-center"
                                >
                                    <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-gold text-navy-deep flex items-center justify-center group-hover/btn:scale-110 transition-transform shadow-lg shadow-gold/20">
                                        <Download className="h-5 w-5" />
                                    </div>
                                    <span className="text-xs font-bold text-white uppercase tracking-widest group-hover/btn:text-gold transition-colors">Baixar PDF</span>
                                </a>
                            </div>
                        </div>
                     </div>
                </div>

                {/* Validation Info Card */}
                 <div className="bg-white/3 backdrop-blur-sm rounded-none border border-white/10 p-5 md:p-8 animate-slide-up delay-200">
                    <div className="flex items-start gap-4 mb-6 md:mb-8">
                        <div className="bg-white/5 p-2 rounded-lg">
                            <ShieldCheck className="h-6 w-6 text-gold" />
                        </div>
                        <div>
                            <h3 className="text-base md:text-lg font-bold text-white">Validação Pública</h3>
                            <p className="text-xs md:text-sm text-white/50">Instruções para verificação.</p>
                        </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-8 md:gap-10 items-center">
                        <div className="flex justify-center">
                            <div className="bg-white p-3 rounded-xl shadow-2xl">
                                <QRCode
                                    value={`${typeof window !== 'undefined' ? window.location.origin : ''}/verify/${profile?.validation_code}`}
                                    size={140}
                                    level="H"
                                    style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                    viewBox={`0 0 256 256`}
                                />
                            </div>
                        </div>
                        <div className="space-y-4 md:space-y-6">
                            <p className="text-xs md:text-sm text-white/70 font-light">
                                Utilize este QR Code para validade pública.
                            </p>
                            
                            <div className="bg-black/20 rounded-lg p-3 md:p-4 border border-white/5">
                                <p className="text-[10px] text-gold uppercase font-bold mb-2 tracking-widest">Código UUID</p>
                                <div className="flex items-center justify-between overflow-x-auto">
                                    <code className="font-mono text-sm md:text-lg font-bold text-white select-all">
                                        {profile?.validation_code}
                                    </code>
                                </div>
                            </div>
                            
                            <a 
                                href={`/verify/${profile?.validation_code}`}
                                target="_blank"
                                className="inline-flex items-center text-xs font-bold uppercase tracking-widest text-gold hover:text-white transition-colors py-2"
                            >
                                Testar link &rarr;
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Column - Academic Stats */}
            <div className="space-y-6 animate-slide-up delay-300">
                <div className="bg-white/3 backdrop-blur-sm border border-white/10 p-5 md:p-6 rounded-none">
                    <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-4 md:mb-6 flex items-center gap-2">
                        <BookOpen className="h-4 w-4" /> Status Acadêmico
                    </h3>
                    
                    <div className="space-y-4">
                        <div className="flex justify-between items-center text-sm pb-4 border-b border-white/5">
                            <span className="text-white/60">Status da Matrícula</span>
                            <span className={`font-bold text-xs px-2 py-1 rounded border uppercase tracking-wide ${
                                profile?.enrollment_status === 'CONCLUÍDO' 
                                ? 'text-green-400 bg-green-900/20 border-green-500/20' 
                                : 'text-blue-400 bg-blue-900/20 border-blue-500/20'
                            }`}>
                                {profile?.enrollment_status || 'CONCLUÍDO'}
                            </span>
                        </div>
                         <div className="flex justify-between items-center text-sm pb-4 border-b border-white/5">
                            <span className="text-white/60">Período Letivo</span>
                            <span className="font-medium text-white">{profile?.academic_period || '2023.2'}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm pb-4 border-b border-white/5">
                            <span className="text-white/60">Média Geral</span>
                            <span className="font-bold text-gold">{profile?.average_grade || '8.75'}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-white/60">RA (Matrícula)</span>
                            <span className="font-mono text-white/80 text-xs sm:text-sm">{profile?.registration_number || '---'}</span>
                        </div>
                    </div>
                </div>

                 <div className="bg-white/3 backdrop-blur-sm border border-white/10 p-5 md:p-6 rounded-none">
                    <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-4 md:mb-6 flex items-center gap-2">
                        <Clock className="h-4 w-4" /> Carga Horária
                    </h3>
                    
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs uppercase font-bold tracking-wider">
                                <span className="text-white/60">Obrigatórias</span>
                                <span className="text-white">{profile?.mandatory_hours_pct || '100%'}</span>
                            </div>
                            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full bg-gold" style={{ width: profile?.mandatory_hours_pct || '100%' }}></div>
                            </div>
                        </div>
 
                         <div className="space-y-2">
                            <div className="flex justify-between text-xs uppercase font-bold tracking-wider">
                                <span className="text-white/60">Complementares</span>
                                <span className="text-white">{profile?.complementary_hours_pct || '100%'}</span>
                            </div>
                            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full bg-[#00A3FF]" style={{ width: profile?.complementary_hours_pct || '100%' }}></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-linear-to-br from-gold to-gold/70 rounded-none shadow-xl shadow-gold/10 p-6 text-navy-deep text-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-white/10 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    <div className="mb-4 flex justify-center relative z-10">
                         <div className="h-12 w-12 bg-navy-deep/10 rounded-full flex items-center justify-center backdrop-blur-sm border border-navy-deep/10">
                            <Calendar className="h-6 w-6 text-navy-deep" />
                         </div>
                    </div>
                    <h3 className="font-bold text-lg mb-1 relative z-10">Colação de Grau</h3>
                    <p className="text-sm text-navy-deep/70 mb-4 font-medium relative z-10">Cerimônia Oficial</p>
                    <button className="w-full py-3 bg-navy-deep text-gold font-bold text-xs uppercase tracking-widest hover:bg-navy-deep/90 active:scale-95 transition-all shadow-lg relative z-10">
                        Ver Fotos
                    </button>
                </div>
            </div>
        </div>
      </main>
    </div>
  )
}

