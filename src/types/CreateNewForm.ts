export interface CreateNewUser {
  firstName: string
  lastName: string
  username: string
  email: string
  password: string
  pin: string
  user_role: 'admin' | 'bar-staff' | 'bar-manager'
  full_name: string
  bio: string
  avatar_url: string
}

export interface EditUser extends Partial<CreateNewUser> {
}



