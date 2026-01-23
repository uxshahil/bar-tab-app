export interface LoginForm {
  email: string
  password: string
}

// Option 1: Simple union (recommended for most cases)
export interface PosLoginForm {
  pin: string
}

// Option 2: If you want role-based validation
export interface RoleBasedPosLogin extends PosLoginForm {
  role?: UserRole
}

export interface RegisterForm extends LoginForm {
  confirmPassword: string
  username: string
  firstName: string
  lastName: string
  pin: string // Will be validated based on role
  role: UserRole
}

// Helper types for compile-time checking
// type Digit = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9'
// export type StaffPin = `${Digit}${Digit}${Digit}${Digit}${Digit}${Digit}`
// export type ManagerPin = `${Digit}${Digit}${Digit}${Digit}${Digit}${Digit}${Digit}${Digit}${Digit}`
