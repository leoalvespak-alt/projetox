'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/utils/supabase/client'
import QRCode from 'react-qr-code'
import { Upload, Lock, FileText, CheckCircle, AlertCircle, Loader2, Image as ImageIcon } from 'lucide-react'

export default function AdminPage() {
  const [password, setPassword] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [logoUploading, setLogoUploading] = useState(false)
  const [uploadedId, setUploadedId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [currentLogo, setCurrentLogo] = useState<string | null>(null)

  useEffect(() => {
    fetchLogo()
  }, [])

  const fetchLogo = async () => {
    const { data } = await supabase.from('site_settings').select('logo_url').single()
    if (data?.logo_url) setCurrentLogo(data.logo_url)
  }

  const handleLogin = () => {
    if (password === 'admin123') {
      setIsAuthenticated(true)
    } else {
      alert('Senha incorreta')
    }
  }

  const handleLogoUpload = async () => {
    if (!logoFile) return
    setLogoUploading(true)
    
    try {
      const fileExt = logoFile.name.split('.').pop()
      const fileName = `logo-${Date.now()}.${fileExt}`
      // Reuse documentos bucket for now, ideally separate 'assets'
      const { error: uploadError } = await supabase.storage
        .from('documentos')
        .upload(fileName, logoFile)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('documentos')
        .getPublicUrl(fileName)

      // Update settings
      const { error: dbError } = await supabase
        .from('site_settings')
        .update({ logo_url: publicUrl })
        .eq('id', 1)

      if (dbError) throw dbError

      setCurrentLogo(publicUrl)
      setLogoFile(null)
      alert('Logo atualizada com sucesso!')
    } catch (err: any) {
      alert('Erro ao atualizar logo: ' + err.message)
    } finally {
      setLogoUploading(false)
    }
  }

  const handleUpload = async () => {
    if (!file) return
    setUploading(true)
    setError(null)
    
    try {
      // 1. Upload to Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('documentos')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('documentos')
        .getPublicUrl(filePath)

      // 2. Insert into database
      const { data, error: dbError } = await supabase
        .from('arquivos')
        .insert({
          nome_arquivo: file.name,
          url_pdf: publicUrl,
        })
        .select()
        .single()

      if (dbError) throw dbError

      setUploadedId(data.id)
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Erro ao fazer upload')
    } finally {
      setUploading(false)
    }
  }

  // Not authenticated view
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 animate-in fade-in duration-500">
        <div className="w-full max-w-md space-y-6 rounded-2xl border bg-white p-8 shadow-xl ring-1 ring-black/5">
          <div className="text-center space-y-2">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-2">
              <Lock className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Admin Login</h1>
            <p className="text-sm text-muted-foreground">Acesso restrito para verificação.</p>
          </div>
          <div className="space-y-4">
            <div className="relative group">
              <input
                type="password"
                placeholder="Senha de acesso"
                className="w-full rounded-lg border border-gray-200 bg-transparent px-4 py-3 text-sm outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10 group-hover:border-primary/50"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>
            <button
              onClick={handleLogin}
              className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary/90 hover:shadow-md focus:ring-4 focus:ring-primary/20 active:scale-[0.98]"
            >
              Entrar
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Authenticated Dashboard
  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-12">
      <div className="mx-auto max-w-4xl space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Painel Administrativo</h1>
            <p className="text-gray-500">Gerencie documentos e configurações do sistema</p>
          </div>
          <button 
            onClick={() => setIsAuthenticated(false)} 
            className="self-start md:self-auto rounded-full border bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
          >
            Sair
          </button>
        </header>

        {/* Config Section */}
        <section className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-gray-500" />
                Logo do Sistema
            </h2>
            <div className="flex flex-col sm:flex-row gap-6 items-start">
                <div className="flex-1 space-y-4 w-full">
                    <label className="block w-full">
                        <span className="sr-only">Escolher logo</span>
                        <input 
                            type="file" 
                            accept="image/*"
                            onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                            className="block w-full text-sm text-gray-500
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-full file:border-0
                            file:text-sm file:font-semibold
                            file:bg-primary/10 file:text-primary
                            hover:file:bg-primary/20"
                        />
                    </label>
                    <button
                        onClick={handleLogoUpload}
                        disabled={!logoFile || logoUploading}
                        className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
                    >
                        {logoUploading ? 'Enviando...' : 'Atualizar Logo'}
                    </button>
                </div>
                {currentLogo && (
                    <div className="shrink-0 p-4 border rounded-lg bg-gray-50">
                        <p className="text-xs text-gray-500 mb-2">Logo Atual:</p>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={currentLogo} alt="Logo Atual" className="h-16 object-contain" />
                    </div>
                )}
            </div>
        </section>

        <main className="rounded-2xl border bg-white p-8 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <FileText className="h-5 w-5 text-gray-500" />
                Upload de Documento
            </h2>
          {!uploadedId ? (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
              <div 
                className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 transition-all ${
                  file ? 'border-primary bg-primary/5' : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="rounded-full bg-white p-4 shadow-sm ring-1 ring-gray-100 mb-4">
                  <FileText className={`h-8 w-8 ${file ? 'text-primary' : 'text-gray-400'}`} />
                </div>
                <label className="cursor-pointer text-center relative z-10">
                  <span className="mt-2 block text-lg font-semibold text-gray-900">
                    {file ? 'Arquivo selecionado' : 'Selecione um arquivo PDF'}
                  </span>
                  <span className="mt-1 block text-sm text-gray-500">
                    {file ? 'Clique para trocar' : 'Arraste e solte ou clique para buscar'}
                  </span>
                  <input
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                </label>
                {file && (
                  <div className="mt-4 flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-sm font-medium text-primary shadow-sm ring-1 ring-primary/20">
                     {file.name}
                  </div>
                )}
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-lg bg-red-50 p-4 text-sm text-red-600 border border-red-100">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}

              <button
                onClick={handleUpload}
                disabled={!file || uploading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 text-base font-semibold text-white shadow-sm transition-all hover:bg-primary/90 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99]"
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" /> Processando Upload...
                  </>
                ) : (
                  <>
                    <Upload className="h-5 w-5" /> Gerar Código de Autenticidade
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-8 animate-in zoom-in duration-300">
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="rounded-full bg-green-100 p-3 mb-2">
                  <CheckCircle className="h-10 w-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Documento Registrado!</h2>
                <p className="text-gray-500 max-w-sm">O código QR abaixo pode ser usado publicamente para validar este documento.</p>
              </div>

              <div className="rounded-2xl border-2 border-gray-100 bg-white p-6 shadow-sm">
                <QRCode
                  value={`${typeof window !== 'undefined' ? window.location.origin : ''}/verify/${uploadedId}`}
                  size={220}
                  level="H"
                />
              </div>
              
              <div className="w-full max-w-md rounded-lg bg-gray-50 p-4 text-center">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Link direto</p>
                <div className="text-sm font-mono text-gray-700 break-all select-all">
                  {`${typeof window !== 'undefined' ? window.location.origin : ''}/verify/${uploadedId}`}
                </div>
              </div>

              <div className="w-full max-w-md rounded-lg bg-blue-50 p-4 text-center border border-blue-100">
                <p className="text-xs font-semibold text-blue-500 uppercase tracking-wider mb-2">Código de Verificação</p>
                <div className="text-xl font-mono font-bold text-blue-900">
                  {uploadedId}
                </div>
              </div>

              <button
                onClick={() => {
                  setFile(null)
                  setUploadedId(null)
                }}
                className="rounded-full px-6 py-2.5 text-sm font-medium text-primary hover:bg-primary/5 transition"
              >
                Registrar Novo Documento
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
