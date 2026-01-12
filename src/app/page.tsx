'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/utils/supabase/client'

export default function Home() {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [logoUrl, setLogoUrl] = useState<string | null>(null)

  useEffect(() => {
    async function fetchSettings() {
      const { data } = await supabase.from('site_settings').select('logo_url').single()
      if (data?.logo_url) setLogoUrl(data.logo_url)
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
    <div className="flex min-h-screen flex-col bg-white">
      {/* Header */}
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

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center pt-12 px-4 bg-gray-50/30">
        <div className="w-full max-w-2xl bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          <form onSubmit={handleSearch} className="flex flex-col gap-6">
             <div className="flex flex-col gap-2">
                <label htmlFor="code" className="text-gray-700 text-sm font-bold uppercase tracking-wide">
                  Código de Autenticação (Hash / ID)
                </label>
                <div className="relative">
                    <input
                      id="code"
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-4 text-lg outline-none focus:border-[#0F3460] focus:ring-1 focus:ring-[#0F3460] transition-all font-mono placeholder:text-gray-300"
                      placeholder="Ex: 123e4567-e89b-12d3-a456-426614174000"
                    />
                </div>
                <p className="text-xs text-gray-400">Insira o código alfanumérico presente no documento.</p>
             </div>
             
             <button
               type="submit"
               className="w-full bg-[#0F3460] text-white px-6 py-4 rounded-lg text-base font-bold uppercase tracking-wider hover:bg-[#154175] transition-all shadow-lg shadow-blue-900/20 active:translate-y-0.5"
             >
               Consultar Base de Dados
             </button>
          </form>
        </div>
        
        <div className="w-full max-w-2xl mt-8 flex items-start gap-3 bg-blue-50 p-4 rounded-lg border border-blue-100">
           <div className="mt-0.5 min-w-[20px]">
               <svg className="w-5 h-5 text-blue-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
               </svg>
           </div>
           <p className="text-sm text-blue-900 leading-relaxed">
               Este sistema consulta a base oficial da instituição para validar a veracidade de diplomas e certificados emitidos digitalmente.
           </p>
        </div>
      </main>

      {/* Footer */}
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
