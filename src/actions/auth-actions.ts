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

export async function updateStudent(formData: FormData) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    return { error: 'Configuration Error: Missing environment variables for Admin.' }
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })

  const userId = formData.get('userId') as string
  const fullName = formData.get('fullName') as string
  const email = formData.get('email') as string
  const courseName = formData.get('courseName') as string
  const registrationNumber = formData.get('registrationNumber') as string
  const diplomaUrl = formData.get('diplomaUrl') as string
  
  const enrollmentStatus = formData.get('enrollmentStatus') as string
  const academicPeriod = formData.get('academicPeriod') as string
  const averageGrade = formData.get('averageGrade') as string
  const mandatoryHoursPct = formData.get('mandatoryHoursPct') as string
  const complementaryHoursPct = formData.get('complementaryHoursPct') as string
  const registrationBook = formData.get('registrationBook') as string
  const issueDate = formData.get('issueDate') as string

  if (!userId) return { error: 'User ID is required for update' }

  // 1. Update Auth Email if changed
  if (email) {
    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      email,
      user_metadata: { full_name: fullName }
    })
    if (authError) return { error: 'Auth update error: ' + authError.message }
  }

  // 2. Update Profile
  const updateData: any = {
    full_name: fullName,
    course_name: courseName,
    registration_number: registrationNumber,
    enrollment_status: enrollmentStatus,
    academic_period: academicPeriod,
    average_grade: averageGrade,
    mandatory_hours_pct: mandatoryHoursPct,
    complementary_hours_pct: complementaryHoursPct,
    registration_book: registrationBook,
    issue_date: issueDate
  }

  if (diplomaUrl) updateData.diploma_url = diplomaUrl

  const { error: dbError } = await supabaseAdmin
    .from('diploma_students')
    .update(updateData)
    .eq('id', userId)

  if (dbError) return { error: 'DB update error: ' + dbError.message }

  return { success: true }
}

export async function deleteStudent(userId: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    return { error: 'Configuration Error' }
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)

  // 1. Delete from Auth (will trigger cascade or handled manually)
  const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId)
  if (authError) return { error: authError.message }

  // 2. Delete from Profile (if not cascaded)
  const { error: dbError } = await supabaseAdmin
    .from('diploma_students')
    .delete()
    .eq('id', userId)

  if (dbError) return { error: dbError.message }

  return { success: true }
}
