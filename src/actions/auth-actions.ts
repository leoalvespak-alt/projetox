'use server'

import { createClient } from '@supabase/supabase-js'

export async function createStudent(formData: FormData) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    return { error: 'Configuration Error: Missing environment variables for Admin.' }
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('fullName') as string
  const courseName = formData.get('courseName') as string
  const registrationNumber = formData.get('registrationNumber') as string
  const diplomaUrl = formData.get('diplomaUrl') as string
  
  const enrollmentStatus = formData.get('enrollmentStatus') as string || 'CONCLUÍDO'
  const academicPeriod = formData.get('academicPeriod') as string || '2023.2'
  const averageGrade = formData.get('averageGrade') as string || '8.75'
  const mandatoryHoursPct = formData.get('mandatoryHoursPct') as string || '100%'
  const complementaryHoursPct = formData.get('complementaryHoursPct') as string || '100%'
  const registrationBook = formData.get('registrationBook') as string || 'LB-2024/47'
  
  const issueDate = formData.get('issueDate') as string || new Date().toLocaleDateString('pt-BR')
  
  // Generate a random validation code if not provided
  // Format: UUID or simplified code. Let's use UUID for uniqueness.
  const validationCode = formData.get('validationCode') as string || crypto.randomUUID()

  // 1. Create Auth User
  const { data: user, error: userError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName }
  })

  if (userError) {
    console.error('Error creating user:', userError)
    return { error: userError.message }
  }

  if (!user.user) {
    return { error: 'User creation failed without error' }
  }

  // 2. Create Profile
  const { error: profileError } = await supabaseAdmin
    .from('diploma_students')
    .insert({
      id: user.user.id,
      full_name: fullName,
      course_name: courseName,
      registration_number: registrationNumber,
      diploma_url: diplomaUrl,
      validation_code: validationCode,
      enrollment_status: enrollmentStatus,
      academic_period: academicPeriod,
      average_grade: averageGrade,
      mandatory_hours_pct: mandatoryHoursPct,
      complementary_hours_pct: complementaryHoursPct,
      registration_book: registrationBook,
      issue_date: issueDate
    })

  if (profileError) {
    console.error('Error creating profile:', profileError)
    // Rollback user creation? For now, just return error.
    await supabaseAdmin.auth.admin.deleteUser(user.user.id)
    return { error: 'Error saving profile: ' + profileError.message }
  }

  return { success: true, validationCode, userId: user.user.id }
}
