'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/utils/supabase/client'
import { FileText, CheckCircle, XCircle, Calendar, Download, Eye, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

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
      
      const { data, error } = await supabase
        .from('arquivos')
        .select('*')
        .eq('id', id)
        .single()

      if (error || !data) {
        setError(true)
      } else {
        setData(data)
      }
      setLoading(false)
    }

    fetchData()
  }, [id])

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#0F3460] border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
       {/* Header Shared */}
       <header className="bg-white border-b border-gray-200 shadow-sm py-6">
        <div className="container mx-auto flex flex-col items-center justify-center gap-3">
           {logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt="Logo Institucional" className="h-20 object-contain" />
          )}
          <div className="text-center">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest">Portal de Transparência</h2>
            <h1 className="text-3xl font-serif text-[#0F3460] font-bold mt-1">Validação de Documentos Digitais</h1>
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 py-12">
        <div className="mx-auto max-w-5xl">
            <Link href="/" className="inline-flex items-center text-[#0F3460] hover:text-blue-800 mb-6 font-medium text-sm transition-colors group">
                <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Voltar para nova consulta
            </Link>

            {error || !data ? (
                 <div className="bg-white p-12 text-center rounded-lg shadow-sm border-t-4 border-red-600">
                    <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-red-100 mb-6">
                        <XCircle className="h-10 w-10 text-red-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 font-serif">Registro Não Encontrado</h1>
                    <p className="mt-4 text-gray-600 max-w-md mx-auto leading-relaxed">
                        O código de identificação <span className="font-mono font-bold text-gray-800">{id}</span> não consta em nossa base de dados oficial. Por favor, verifique se o código foi digitado corretamente.
                    </p>
                    <div className="mt-8">
                       <p className="text-xs text-gray-400">Data da consulta: {new Date().toLocaleString('pt-BR')}</p>
                    </div>
                </div>
            ) : (
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Information Column */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-lg shadow-sm border-t-4 border-green-600 overflow-hidden">
                             <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                 <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                                     <CheckCircle className="h-5 w-5 text-green-600" />
                                     Relatório de Autenticidade
                                 </h3>
                                 <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold uppercase tracking-wide border border-green-200">
                                     Válido
                                 </span>
                             </div>
                             
                             <div className="p-6">
                                 <div className="grid sm:grid-cols-2 gap-y-6 gap-x-12">
                                     <div>
                                         <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Nome do Documento / Titular</p>
                                         <p className="text-gray-900 font-medium text-lg border-b border-gray-100 pb-2">
                                             {data.nome_arquivo}
                                         </p>
                                     </div>
                                     <div>
                                         <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Data de Registro</p>
                                         <p className="text-gray-900 font-medium text-lg border-b border-gray-100 pb-2">
                                              {new Date(data.created_at).toLocaleDateString('pt-BR', {
                                                day: '2-digit', month: 'long', year: 'numeric',
                                                hour: '2-digit', minute: '2-digit'
                                             })}
                                         </p>
                                     </div>
                                     <div className="sm:col-span-2">
                                         <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Código de Autenticação (Hash)</p>
                                         <p className="font-mono text-sm text-gray-600 bg-gray-50 p-2 rounded border border-gray-200 break-all">
                                             {data.id}
                                         </p>
                                     </div>
                                     <div className="sm:col-span-2">
                                         <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Mensagem Institucional</p>
                                         <p className="text-sm text-gray-600 italic">
                                             "Certificamos que o documento digital apresentado confere com os registros originais custodiados por esta instituição."
                                         </p>
                                     </div>
                                 </div>
                             </div>
                             
                             <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row gap-3">
                                <a 
                                    href={data.url_pdf} 
                                    target="_blank"
                                    className="flex-1 inline-flex justify-center items-center gap-2 bg-[#0F3460] text-white px-4 py-2.5 rounded hover:bg-[#154175] transition font-medium text-sm"
                                >
                                    <Eye className="h-4 w-4" /> Visualizar Original
                                </a>
                                <a 
                                    href={data.url_pdf}
                                    download={data.nome_arquivo}
                                    className="flex-1 inline-flex justify-center items-center gap-2 bg-white text-gray-700 border border-gray-300 px-4 py-2.5 rounded hover:bg-gray-50 transition font-medium text-sm"
                                >
                                    <Download className="h-4 w-4" /> Baixar Cópia
                                </a>
                             </div>
                        </div>
                        
                        <div className="text-center text-xs text-gray-400">
                             Consulta realizada em {new Date().toLocaleString('pt-BR')} via IP público.
                        </div>
                    </div>

                    {/* Preview Column */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-1 rounded shadow-sm border border-gray-200">
                             <div className="bg-gray-100 aspect-[1/1.4] w-full relative group overflow-hidden">
                                <iframe 
                                    src={`${data.url_pdf}#toolbar=0&navpanes=0&scrollbar=0`}
                                    className="w-full h-full"
                                    title="Miniatura do Documento"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors pointer-events-none" />
                             </div>
                             <p className="text-center text-xs font-medium text-gray-500 mt-2 mb-1">Pré-visualização</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
      </main>

      {/* Footer Shared */}
       <footer className="mt-auto bg-[#0F3460] text-white">
        <div className="container mx-auto py-10 px-4">
           <div className="flex flex-col items-center gap-6 text-center">
                {logoUrl && (
                    <div className="bg-white p-3 rounded-lg">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={logoUrl} alt="Logo Footer" className="h-10 object-contain" />
                    </div>
                )}
               <div className="space-y-1">
                 <p className="text-sm font-semibold tracking-wide">CONFIRMAÇÃO DE AUTENTICIDADE DE DOCUMENTOS</p>
                 <p className="text-xs text-blue-200 max-w-lg mx-auto">
                    Este serviço destina-se a verificar a autenticidade de documentos emitidos pela instituição. A verificação é realizada em tempo real contra a base de dados oficial.
                 </p>
               </div>
               <div className="w-24 h-0.5 bg-blue-400/30 my-2"></div>
               <p className="text-[10px] text-blue-300 uppercase tracking-widest">
                   © {new Date().getFullYear()} Todos os direitos reservados
               </p>
           </div>
        </div>
      </footer>
    </div>
  )
}
