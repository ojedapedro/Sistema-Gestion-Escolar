
import { Representative, Student, Payment, Level, Grade, PaymentMethod, PaymentStatus } from '../types';

// This special 'google' object is injected by the Apps Script environment when the app is served.
declare const google: any;

/**
 * A helper function to wrap google.script.run calls in a Promise.
 * This makes the asynchronous calls easier to work with in the React app.
 * @param functionName The name of the function to call in Code.gs
 * @param args The arguments to pass to the function
 */
const runGAS = <T,>(functionName: string, ...args: any[]): Promise<T> => {
  return new Promise<T>((resolve, reject) => {
    google.script.run
      .withSuccessHandler(resolve)
      .withFailureHandler(reject)
      [functionName](...args);
  });
};


class GoogleSheetsService {
  
  constructor() {
    console.log("GoogleSheetsService initialized. Connecting to live backend.");
  }

  async getRepresentativeByCedula(cedula: string): Promise<Representative | null> {
    return runGAS<Representative | null>('getRepresentativeByCedula', cedula);
  }
  
  async getPaymentsByStatus(status: PaymentStatus | PaymentStatus[]): Promise<Payment[]> {
    const statuses = Array.isArray(status) ? status : [status];
    return runGAS<Payment[]>('getPaymentsByStatus', statuses);
  }
  
  async updatePaymentStatus(paymentId: string, newStatus: 'approved' | 'rejected'): Promise<boolean> {
     return runGAS<boolean>('updatePaymentStatus', paymentId, newStatus);
  }

  async getPaymentsForStudent(studentId: string, month: number, year: number): Promise<Payment[]> {
    return runGAS<Payment[]>('getPaymentsForStudent', studentId, month, year);
  }

  async addPayment(payment: Omit<Payment, 'id' | 'timestamp' | 'registrationDate'>): Promise<Payment> {
    // GAS functions handle JSON objects well, so we can pass the object directly.
    return runGAS<Payment>('addPayment', payment);
  }

  async addStudentAndRepresentative(data: { repCedula: string; repName: string; phone: string; email: string; address: string; studentName: string; level: Level; grade: Grade; section: string }): Promise<Representative> {
    return runGAS<Representative>('addStudentAndRepresentative', data);
  }
    
  async getAllDataForReports(): Promise<{ representatives: Representative[], payments: Payment[] }> {
    return runGAS<{ representatives: Representative[], payments: Payment[] }>('getAllDataForReports');
  }
}

export const schoolApiService = new GoogleSheetsService();
