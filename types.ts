
export enum Level {
  MATERNAL = 'Maternal',
  PREESCOLAR = 'Pre-escolar',
  PRIMARIA = 'Primaria',
  SECUNDARIA = 'Secundaria',
}

export type Grade = string;

export interface Student {
  id: string; // unique student id e.g., cedula-1
  name: string;
  level: Level;
  grade: Grade;
  section: string;
}

export interface Representative {
  cedula: string;
  fullName: string;
  phone?: string;
  email?: string;
  address?: string;
  matricula: string;
  students: Student[];
}

export enum PaymentMethod {
  PAGO_MOVIL = 'Pago Móvil',
  TRANSFERENCIA = 'Transferencia',
  ZELLE = 'Zelle',
  EFECTIVO_BS = 'Efectivo Bs.',
  EFECTIVO_USD = 'Efectivo $',
  EFECTIVO_EUR = 'Efectivo €',
  TDC = 'TDC',
  TDD = 'TDD',
}

export type PaymentStatus = 'pending-verification' | 'approved' | 'rejected';

export interface Payment {
  id: string;
  timestamp: string; // ISO string
  registrationDate: string; // YYYY-MM-DD
  paymentDate: string; // YYYY-MM-DD
  representativeCedula: string;
  representativeName: string;
  matricula: string;
  studentId: string;
  month: number; // 1-12
  year: number;
  paymentMethod: PaymentMethod;
  reference?: string;
  amount: number;
  status: PaymentStatus;
  observations?: string;
}

export interface StudentPaymentSummary {
  student: Student;
  monthlyFee: number;
  totalPaid: number;
  pendingBalance: number;
  status: 'Solvente' | 'Moroso';
  payments: Payment[];
}
