'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/utils/supabase/client'
import QRCode from 'react-qr-code'
import { Upload, Lock, FileText, CheckCircle, AlertCircle, Loader2, Image as ImageIcon, UserPlus, GraduationCap, Mail, Key, Hash, Users, RefreshCw, ExternalLink } from 'lucide-react'
import { createStudent } from '@/actions/auth-actions'

interface Student {
  id: string
  full_name: string
  course_name: string
  registration_number: string
  validation_code: string
  diploma_url: string
  created_at: string
}

export default function AdminPage() {
  const [password, setPassword] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  
  // Generic File Upload State
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadedId, setUploadedId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Logo Upload State
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoUploading, setLogoUploading] = useState(false)
  const [currentLogo, setCurrentLogo] = useState<string | null>(null)

  // Student Registration State
  const [studentForm, setStudentForm] = useState({
    fullName: '',
    email: '',
    password: '',
    courseName: '',
    registrationNumber: ''
  })
  const [studentDiplomaFile, setStudentDiplomaFile] = useState<File | null>(null)
  const [studentLoading, setStudentLoading] = useState(false)
  const [students, setStudents] = useState<Student[]>([])
  const [loadingStudents, setLoadingStudents] = useState(false)


  useEffect(() => {
    fetchLogo()
    if (isAuthenticated) fetchStudents()
  }, [isAuthenticated])

  const fetchStudents = async () => {
    setLoadingStudents(true)
    const { data } = await supabase
        .from('diploma_students')
        .select('*')
        .order('created_at', { ascending: false })
    
    if (data) setStudents(data)
    setLoadingStudents(false)
  }

  const fetchLogo = async () => {
    const { data } = await supabase.from('site_settings').select('logo_url').single()
    if (data?.logo_url) setCurrentLogo(data.logo_url)
  }

  const handleLogin = () => {
    // Simple authentication for prototype
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
      const { error: uploadError } = await supabase.storage
        .from('documentos')
        .upload(fileName, logoFile)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('documentos')
        .getPublicUrl(fileName)

      const { error: dbError } = await supabase
        .from('site_settings')
        .update({ logo_url: publicUrl })
        .eq('id', 1)

      if (dbError) throw dbError

      setCurrentLogo(publicUrl)
      setLogoFile(null)
      alert('Logo atualizada com sucesso!')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      alert('Erro ao atualizar logo: ' + errorMessage)
    } finally {
      setLogoUploading(false)
    }
  }

  const handleUpload = async () => {
    if (!file) return
    setUploading(true)
    setError(null)
    
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('documentos')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('documentos')
        .getPublicUrl(filePath)

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
    } catch (err) {
      console.error(err)
      const errorMessage = err instanceof Error ? err.message : 'Erro ao fazer upload'
      setError(errorMessage)
    } finally {
      setUploading(false)
    }
  }

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!studentDiplomaFile) {
      alert('Por favor, faça o upload do diploma do aluno.')
      return
    }
    setStudentLoading(true)

    try {
      // 1. Upload Diploma to generated path
      const fileExt = studentDiplomaFile.name.split('.').pop()
      // Use clean filename
      const cleanName = studentDiplomaFile.name.replace(/[^a-zA-Z0-9]/g, '_')
      const fileName = `diplomas/${Date.now()}_${cleanName}.${fileExt}`
      
      const { error: uploadError } = await supabase.storage
        .from('documentos')
        .upload(fileName, studentDiplomaFile)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('documentos')
        .getPublicUrl(fileName)

      // 2. Call Server Action
      const formData = new FormData()
      formData.append('fullName', studentForm.fullName)
      formData.append('email', studentForm.email)
      formData.append('password', studentForm.password)
      formData.append('courseName', studentForm.courseName)
      formData.append('registrationNumber', studentForm.registrationNumber)
      formData.append('diplomaUrl', publicUrl)

      // Use the action
      const result = await createStudent(formData)

      if (result.error) {
        throw new Error(result.error)
      }

      alert(`Aluno cadastrado com sucesso!\nCódigo: ${result.validationCode}`)
      
      // Reset
      setStudentForm({
        fullName: '',
        email: '',
        password: '',
        courseName: '',
        registrationNumber: ''
      })
      setStudentDiplomaFile(null)
      fetchStudents() // Refresh list

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      alert('Erro ao cadastrar aluno: ' + errorMessage)
    } finally {
      setStudentLoading(false)
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
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Painel Administrativo</h1>
            <p className="text-gray-500">Gerencie documentos, alunos e configurações.</p>
          </div>
          <button 
            onClick={() => setIsAuthenticated(false)} 
            className="self-start md:self-auto rounded-full border bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
          >
            Sair
          </button>
        </header>

        <div className="grid md:grid-cols-2 gap-8">
            {/* Student Registration Column */}
            <div className="md:col-span-2 space-y-8">
                <section className="rounded-2xl border bg-white p-8 shadow-sm">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2 border-b pb-4">
                        <UserPlus className="h-6 w-6 text-blue-600" />
                        Cadastro de Aluno e Emissão de Diploma
                    </h2>
                    
                    <form onSubmit={handleCreateStudent} className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <UserPlus className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <input 
                                        type="text"
                                        required
                                        className="pl-10 w-full rounded-lg border border-gray-300 py-2.5 px-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                        placeholder="Ex: João da Silva"
                                        value={studentForm.fullName}
                                        onChange={e => setStudentForm({...studentForm, fullName: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <input 
                                        type="email"
                                        required
                                        className="pl-10 w-full rounded-lg border border-gray-300 py-2.5 px-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                        placeholder="aluno@email.com"
                                        value={studentForm.email}
                                        onChange={e => setStudentForm({...studentForm, email: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Senha Provisória</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Key className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <input 
                                        type="text"
                                        required
                                        className="pl-10 w-full rounded-lg border border-gray-300 py-2.5 px-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                        placeholder="Senha inicial"
                                        value={studentForm.password}
                                        onChange={e => setStudentForm({...studentForm, password: e.target.value})}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                             <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Curso / Graduação</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <GraduationCap className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <input 
                                        type="text"
                                        required
                                        className="pl-10 w-full rounded-lg border border-gray-300 py-2.5 px-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                        placeholder="Ex: Direito"
                                        value={studentForm.courseName}
                                        onChange={e => setStudentForm({...studentForm, courseName: e.target.value})}
                                    />
                                </div>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Matrícula / Registro</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Hash className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <input 
                                        type="text"
                                        className="pl-10 w-full rounded-lg border border-gray-300 py-2.5 px-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                        placeholder="Opcional"
                                        value={studentForm.registrationNumber}
                                        onChange={e => setStudentForm({...studentForm, registrationNumber: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Diploma (PDF)</label>
                                <input 
                                    type="file"
                                    accept="application/pdf"
                                    required
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-colors cursor-pointer border border-gray-200 rounded-lg bg-gray-50"
                                    onChange={(e) => setStudentDiplomaFile(e.target.files?.[0] || null)}
                                />
                                {studentDiplomaFile && (
                                    <p className="mt-1 text-xs text-green-600 font-medium">Arquivo selecionado: {studentDiplomaFile.name}</p>
                                )}
                            </div>
                        </div>

                        <div className="md:col-span-2 pt-4 border-t border-gray-100 flex justify-end">
                             <button
                                type="submit"
                                disabled={studentLoading}
                                className="bg-[#0F3460] text-white px-8 py-3 rounded-lg font-bold hover:bg-[#154175] transition-all shadow-lg shadow-blue-900/10 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                             >
                                {studentLoading ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin" /> Processando...
                                    </>
                                ) : (
                                    <>
                                        <ChecksAndPlusIcon /> Cadastrar Aluno
                                    </>
                                )}
                             </button>
                        </div>
                    </form>
                </section>
            </div>
            
            {/* Existing Tools Column */}
            <div className="md:col-span-2 grid md:grid-cols-2 gap-8">
                 {/* Config Section */}
                <section className="rounded-2xl border bg-white p-6 shadow-sm">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <ImageIcon className="h-5 w-5 text-gray-500" />
                        Logo do Sistema
                    </h2>
                    <div className="space-y-4">
                        <input 
                            type="file" 
                            accept="image/*"
                            onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                            className="block w-full text-sm text-gray-500
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-full file:border-0
                            file:text-sm file:font-semibold
                            file:bg-primary/10 file:text-primary
                            hover:file:bg-primary/20 cursor-pointer"
                        />
                         <div className="flex items-center gap-4">
                            <button
                                onClick={handleLogoUpload}
                                disabled={!logoFile || logoUploading}
                                className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50 flex-1"
                            >
                                {logoUploading ? 'Enviando...' : 'Atualizar Logo'}
                            </button>
                            {currentLogo && (
                                <div className="h-10 w-auto p-1 bg-gray-50 rounded border">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={currentLogo} alt="Logo" className="h-full object-contain" />
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                <main className="rounded-2xl border bg-white p-8 shadow-sm">
                    <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                        <FileText className="h-5 w-5 text-gray-500" />
                        Upload Avulso (Legado)
                    </h2>
                {!uploadedId ? (
                    <div className="space-y-6">
                    <div 
                        className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-all ${
                        file ? 'border-primary bg-primary/5' : 'border-gray-200 hover:bg-gray-50'
                        }`}
                    >
                        <div className="rounded-full bg-white p-3 shadow-sm ring-1 ring-gray-100 mb-3">
                        <FileText className={`h-6 w-6 ${file ? 'text-primary' : 'text-gray-400'}`} />
                        </div>
                        <label className="cursor-pointer text-center relative z-10">
                        <span className="block text-sm font-semibold text-gray-900">
                            {file ? 'Arquivo selecionado' : 'Selecione um PDF'}
                        </span>
                        <input
                            type="file"
                            accept="application/pdf"
                            className="hidden"
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                        />
                        </label>
                        {file && (
                        <div className="mt-2 text-xs font-medium text-primary">
                            {file.name}
                        </div>
                        )}
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-100">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        {error}
                        </div>
                    )}

                    <button
                        onClick={handleUpload}
                        disabled={!file || uploading}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary/90 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {uploading ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" /> Processando...
                        </>
                        ) : (
                        <>
                            <Upload className="h-4 w-4" /> Gerar Código
                        </>
                        )}
                    </button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center space-y-4 animate-in zoom-in duration-300">
                    <div className="flex flex-col items-center text-center space-y-1">
                        <div className="rounded-full bg-green-100 p-2 mb-1">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900">Documento Registrado!</h2>
                    </div>

                    <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                        <QRCode
                        value={`${typeof window !== 'undefined' ? window.location.origin : ''}/verify/${uploadedId}`}
                        size={150}
                        level="H"
                        />
                    </div>
                    
                    <div className="w-full rounded-lg bg-blue-50 p-3 text-center border border-blue-100">
                        <p className="text-[10px] font-semibold text-blue-500 uppercase tracking-wider mb-1">Código de Verificação</p>
                        <div className="text-lg font-mono font-bold text-blue-900 select-all">
                        {uploadedId}
                        </div>
                    </div>

                    <button
                        onClick={() => {
                        setFile(null)
                        setUploadedId(null)
                        }}
                        className="text-xs font-medium text-primary hover:underline transition"
                    >
                        Registrar Novo
                    </button>
                    </div>
                )}
                </main>
            </div>


        </div>
        
        {/* Student List Section */}
        <section className="rounded-2xl border bg-white shadow-sm overflow-hidden">
             <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <Users className="h-6 w-6 text-gray-500" />
                    Alunos Registrados
                </h2>
                <button 
                    onClick={fetchStudents} 
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition"
                    title="Atualizar Lista"
                >
                    <RefreshCw className={`h-5 w-5 ${loadingStudents ? 'animate-spin' : ''}`} />
                </button>
             </div>
             
             <div className="overflow-x-auto">
                 <table className="w-full text-left text-sm">
                     <thead className="bg-gray-50 text-gray-500 font-medium">
                         <tr>
                             <th className="px-6 py-4">Nome do Aluno</th>
                             <th className="px-6 py-4">Curso</th>
                             <th className="px-6 py-4">Matrícula</th>
                             <th className="px-6 py-4">Código de Validação</th>
                             <th className="px-6 py-4">Diploma</th>
                             <th className="px-6 py-4">Data Registro</th>
                         </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-100">
                         {loadingStudents ? (
                             <tr>
                                 <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                     <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                                     Carregando ados...
                                 </td>
                             </tr>
                         ) : students.length === 0 ? (
                             <tr>
                                 <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                     Nenhum aluno registrado ainda.
                                 </td>
                             </tr>
                         ) : (
                             students.map((student) => (
                                 <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                                     <td className="px-6 py-4 font-medium text-gray-900">{student.full_name}</td>
                                     <td className="px-6 py-4 text-gray-600">{student.course_name}</td>
                                     <td className="px-6 py-4 text-gray-500 font-mono">{student.registration_number || '-'}</td>
                                     <td className="px-6 py-4">
                                         <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 font-mono">
                                             {student.validation_code}
                                         </span>
                                     </td>
                                     <td className="px-6 py-4">
                                         <a 
                                             href={student.diploma_url} 
                                             target="_blank" 
                                             rel="noreferrer"
                                             className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                                         >
                                             PDF <ExternalLink className="h-3 w-3" />
                                         </a>
                                     </td>
                                     <td className="px-6 py-4 text-gray-500">
                                         {new Date(student.created_at).toLocaleDateString()}
                                     </td>
                                 </tr>
                             ))
                         )}
                     </tbody>
                 </table>
             </div>
        </section>

        </div>
      </div>
  )
}

function ChecksAndPlusIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/>
        </svg>
    )
}
