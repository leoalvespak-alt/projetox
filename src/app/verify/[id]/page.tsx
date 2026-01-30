'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/utils/supabase/client'
import { CheckCircle, XCircle, Download, Eye, ArrowLeft, ShieldCheck, FileText } from 'lucide-react'
import Link from 'next/link'
import QRCode from 'react-qr-code'

interface Arquivo {
  id: string
  nome_arquivo: string
  url_pdf: string
  created_at: string
}

export default function VerifyPage() {
  const params = useParams()
  const rawId = params?.id
  const id = Array.isArray(rawId) ? rawId[0] : rawId

  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<Arquivo | null>(null)
  const [error, setError] = useState(false)
  const [logoUrl, setLogoUrl] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
       // Fetch Logo
       const { data: settings } = await supabase.from('site_settings').select('logo_url').single()
       if (settings?.logo_url) setLogoUrl(settings.logo_url)

      if (!id) return
      
      // 1. Try generic files
      const { data: arquivo } = await supabase
        .from('arquivos')
        .select('*')
        .eq('id', id)
        .single()

      if (arquivo) {
        setData(arquivo)
        setLoading(false)
        return
      }

      // 2. Try Student Profile (Validation Code)
      const { data: profile } = await supabase
        .from('diploma_students')
        .select('*')
        .eq('validation_code', id)
        .single()
      
      if (profile) {
         setData({
            id: profile.validation_code,
            nome_arquivo: `Diploma - ${profile.full_name} (${profile.course_name})`,
            url_pdf: profile.diploma_url,
            created_at: profile.created_at
         })
         setLoading(false)
         return
      }

      // If neither found
      setError(true)
      setLoading(false)
    }

    fetchData()
  }, [id])

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#002B49]">
         <div className="flex flex-col items-center gap-4">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#C5A059] border-t-transparent shadow-[0_0_15px_rgba(197,160,89,0.3)]" />
            <p className="text-[#C5A059] text-xs font-bold uppercase tracking-widest animate-pulse">Verificando Autenticidade...</p>
         </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#002B49] text-white selection:bg-[#C5A059] selection:text-[#002B49]">
       
       {/* Background Decor */}
       <div className="fixed inset-0 bg-[#002B49] z-[-1]"></div>
       <div className="fixed top-0 left-0 w-full h-[500px] bg-gradient-to-b from-[#003B64]/50 to-transparent pointer-events-none z-[-1]"></div>

       {/* Header Shared */}
      <header className="bg-[#002B49]/80 backdrop-blur-md border-b border-white/5 py-4 sm:py-6 sticky top-0 z-50 safe-top">
        <div className="container mx-auto px-4 flex flex-col items-center justify-center gap-3 md:gap-4 text-center">
           {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt="Logo Institucional" className="h-10 md:h-12 object-contain brightness-0 invert opacity-90" />
          ) : (
             <div className="flex items-center gap-2 text-[#C5A059] border border-[#C5A059]/30 px-3 py-1.5 rounded-lg bg-[#C5A059]/5">
                <ShieldCheck className="w-5 h-5" />
                <span className="font-serif font-bold tracking-wider">VERITAS</span>
             </div>
          )}
          <div>
            <h2 className="text-[9px] md:text-[10px] font-bold text-[#C5A059] uppercase tracking-[0.2em] mb-1">Sistema de Autenticação</h2>
            <h1 className="text-lg sm:text-2xl font-serif text-white/90 font-medium tracking-wide">Validação de Documentos Digitais</h1>
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 py-8 md:py-12">
        <div className="mx-auto max-w-5xl">
            <Link href="/" className="inline-flex items-center text-white/50 hover:text-[#C5A059] mb-6 md:mb-8 font-medium text-xs uppercase tracking-widest transition-colors group p-2 -ml-2">
                <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Voltar para nova consulta
            </Link>

            {error || !data ? (
                 <div className="bg-white/[0.03] backdrop-blur-md p-8 md:p-12 text-center rounded-none border border-red-500/30 animate-fade-in">
                    <div className="inline-flex items-center justify-center h-20 w-20 md:h-24 md:w-24 rounded-full bg-red-500/10 mb-6 border border-red-500/20 shadow-lg shadow-red-900/20">
                        <XCircle className="h-10 w-10 text-red-500" />
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold text-white font-serif mb-2">Registro Não Encontrado</h1>
                    <p className="mt-4 text-sm md:text-base text-white/60 max-w-lg mx-auto leading-relaxed">
                        O código de identificação <span className="font-mono font-bold text-[#C5A059] bg-[#C5A059]/10 px-2 py-0.5 rounded break-all">{id}</span> não consta em nossa base de dados oficial. 
                    </p>
                    <div className="mt-8 pt-8 border-t border-white/5">
                       <p className="text-[10px] text-white/30 uppercase tracking-widest">Data da consulta: {new Date().toLocaleString('pt-BR')}</p>
                    </div>
                </div>
            ) : (
                <div className="grid lg:grid-cols-3 gap-8 animate-slide-up">
                    {/* Information Column */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white/[0.03] backdrop-blur-md rounded-none border border-green-500/30 overflow-hidden relative group">
                             <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
                             
                             <div className="px-5 py-4 md:px-6 md:py-5 border-b border-white/5 flex justify-between items-center bg-green-500/5">
                                 <h3 className="font-semibold text-green-400 flex items-center gap-2 text-xs md:text-sm uppercase tracking-wide">
                                     <CheckCircle className="h-5 w-5" />
                                     Relatório de Autenticidade
                                 </h3>
                                 <span className="px-2 py-1 md:px-3 md:py-1 bg-green-500/10 text-green-400 text-[9px] md:text-[10px] font-bold uppercase tracking-wider border border-green-500/20 rounded-full shadow-[0_0_10px_rgba(74,222,128,0.1)]">
                                     Documento Válido
                                 </span>
                             </div>
                             
                             <div className="p-6 md:p-8">
                                 <div className="grid sm:grid-cols-2 gap-y-6 md:gap-y-8 gap-x-12">
                                     <div className="sm:col-span-2">
                                         <p className="text-[10px] font-bold text-[#C5A059] uppercase tracking-widest mb-2 flex items-center gap-2">
                                            <FileText className="w-3 h-3" /> Documento / Titular
                                         </p>
                                         <p className="text-white font-serif text-xl md:text-2xl leading-tight">
                                             {data.nome_arquivo}
                                         </p>
                                     </div>
                                     
                                     <div>
                                         <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Data de Registro</p>
                                         <p className="text-white/90 font-mono text-xs md:text-sm border-l-2 border-white/10 pl-3">
                                              {new Date(data.created_at).toLocaleDateString('pt-BR', {
                                                day: '2-digit', month: 'long', year: 'numeric',
                                                hour: '2-digit', minute: '2-digit'
                                             })}
                                         </p>
                                     </div>
                                     
                                     <div className="sm:col-span-2">
                                         <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Hash SHA-256 (ID Unico)</p>
                                         <p className="font-mono text-xs text-[#C5A059] bg-[#C5A059]/5 p-3 border border-[#C5A059]/20 break-all select-all hover:bg-[#C5A059]/10 transition-colors cursor-text">
                                             {data.id}
                                         </p>
                                     </div>
                                     
                                     <div className="sm:col-span-2 pt-6 border-t border-white/5">
                                         <p className="text-sm text-white/60 italic font-light">
                                             &quot;Certificamos que o documento digital apresentado confere com os registros originais custodiados por esta instituição de ensino.&quot;
                                         </p>
                                     </div>
                                 </div>
                             </div>
                             
                             <div className="bg-white/5 px-4 py-4 md:px-6 flex flex-col sm:flex-row gap-3">
                                <a 
                                    href={data.url_pdf} 
                                    target="_blank"
                                    className="flex-1 inline-flex justify-center items-center gap-2 bg-[#C5A059] text-[#002B49] px-4 py-3 hover:bg-[#D4AF37] active:scale-[0.98] transition font-bold text-xs uppercase tracking-widest shadow-lg shadow-black/20"
                                >
                                    <Eye className="h-4 w-4" /> Visualizar Original
                                </a>
                                <a 
                                    href={data.url_pdf}
                                    download={data.nome_arquivo}
                                    className="flex-1 inline-flex justify-center items-center gap-2 bg-transparent text-white border border-white/20 px-4 py-3 hover:bg-white/5 active:bg-white/10 transition font-bold text-xs uppercase tracking-widest"
                                >
                                    <Download className="h-4 w-4" /> Baixar Cópia
                                </a>
                             </div>
                        </div>
                        
                        <div className="text-center text-[10px] text-white/30 uppercase tracking-widest">
                             Consulta pública realizada em {new Date().toLocaleString('pt-BR')}
                        </div>
                    </div>

                    {/* Preview Column */}
                    <div className="lg:col-span-1">
                        <div className="bg-white/[0.03] backdrop-blur-md p-1 border border-white/10 shadow-2xl relative group">
                             <div className="absolute top-0 right-0 p-2 z-10">
                                 <div className="bg-[#002B49] text-white text-[10px] font-bold px-2 py-1 uppercase tracking-widest border border-[#C5A059]/50">
                                    Preview
                                 </div>
                             </div>
                             <div className="bg-white/5 aspect-[1/1.4] w-full relative group overflow-hidden">
                                <iframe 
                                    src={`${data.url_pdf}#toolbar=0&navpanes=0&scrollbar=0`}
                                    className="w-full h-full opacity-80 group-hover:opacity-100 transition-opacity duration-500 mix-blend-screen group-hover:mix-blend-normal"
                                    title="Miniatura do Documento"
                                />
                                <div className="absolute inset-0 bg-[#002B49]/20 pointer-events-none group-hover:bg-transparent transition-colors" />
                             </div>
                        </div>
                        
                         <div className="mt-8 bg-white/[0.03] backdrop-blur-md p-6 border border-white/10">
                            <div className="flex justify-center mb-4">
                                <div className="bg-white p-2 rounded shadow-sm">
                                    <QRCode
                                        value={typeof window !== 'undefined' ? window.location.href : ''}
                                        size={100}
                                        level="L"
                                        style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                        viewBox={`0 0 256 256`}
                                    />
                                </div>
                            </div>
                            <p className="text-center text-[10px] text-white/50 uppercase tracking-widest">QR Code desta consulta</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
      </main>

      {/* Footer Shared */}
       <footer className="mt-auto bg-[#001f35] border-t border-white/5">
        <div className="container mx-auto py-10 px-4">
           <div className="flex flex-col items-center gap-6 text-center text-white">
                {logoUrl && (
                    <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={logoUrl} alt="Logo Footer" className="h-8 object-contain brightness-0 invert opacity-60" />
                    </div>
                )}
               <div className="space-y-2">
                 <p className="text-sm font-bold tracking-[0.2em] text-[#C5A059] uppercase">Veritas Security System</p>
                 <p className="text-xs text-blue-100/40 max-w-lg mx-auto font-light leading-relaxed">
                    Este serviço destina-se a verificar a autenticidade de documentos emitidos pela instituição. A verificação é realizada em tempo real contra a base de dados oficial protegida por criptografia.
                 </p>
               </div>
               <div className="w-12 h-[1px] bg-[#C5A059]/30 my-2"></div>
               <p className="text-[10px] text-white/20 uppercase tracking-[0.3em] font-semibold">
                   © {new Date().getFullYear()} Todos os direitos reservados
               </p>
           </div>
        </div>
      </footer>
    </div>
  )
}
