
import { Representative, Student, Payment, Level, Grade, PaymentMethod, PaymentStatus } from '../types';

// Declare google type for TypeScript
declare const google: any;

// --- MOCK DATA GENERATORS ---
// Defined outside the class to be used as fallback
const generateMockId = () => `mock-${Math.random().toString(36).substr(2, 9)}`;

const mockServerFunctions: { [key: string]: (...args: any[]) => any } = {
    getRepresentativeByCedula: (cedula: string) => {
      console.log('[MOCK] getRepresentativeByCedula', { cedula });
      if (cedula === '12345678') {
        return {
          cedula: '12345678',
          fullName: 'Juan Pérez (Simulado)',
          phone: '0414-1234567',
          email: 'juan@test.com',
          address: 'Calle Falsa 123',
          matricula: 'mat-2024-25-12345678',
          students: [{ id: 'uuid-sim-1', representativeCedula: '12345678', name: 'Ana Pérez', level: 'Primaria', grade: '3er Grado', section: 'B' }],
        };
      }
      return null;
    },
    addStudentAndRepresentative: (data: any) => {
      console.log('[MOCK] addStudentAndRepresentative', data);
      return {
        cedula: data.repCedula,
        fullName: data.repName,
        phone: data.phone,
        email: data.email,
        address: data.address,
        matricula: `mat-2024-25-${data.repCedula}`,
        students: [{ 
            id: generateMockId(), 
            representativeCedula: data.repCedula,
            name: data.studentName, 
            level: data.level, 
            grade: data.grade, 
            section: data.section 
        }],
      };
    },
    getPaymentsByStatus: (status: any) => {
       console.log('[MOCK] getPaymentsByStatus', { status });
       if(Array.isArray(status) && status.includes('pending-verification')) {
         return [
           { id: 'p-mock-1', paymentDate: '2024-07-29', representativeName: 'Maria Rodriguez (Simulado)', representativeCedula: '87654321', amount: 50, paymentMethod: 'Pago Móvil', reference: '0123456', status: 'pending-verification', matricula: 'mat-123' },
         ];
       }
       return [];
    },
    updatePaymentStatus: (id: string, status: string) => {
      console.log('[MOCK] updatePaymentStatus', { id, status });
      return true;
    },
    getPaymentsForStudent: (id: string) => {
       console.log('[MOCK] getPaymentsForStudent', { id });
       return [];
    },
    addPayment: (payment: any) => {
      console.log('[MOCK] addPayment', payment);
      return { ...payment, id: generateMockId(), timestamp: new Date().toISOString(), registrationDate: new Date().toISOString().split('T')[0] };
    },
    getAllDataForReports: () => {
      console.log('[MOCK] getAllDataForReports');
      return { representatives: [], payments: [] };
    }
};

/**
 * Executes a Google Apps Script function.
 * dynamically checks if `google.script.run` is available.
 * If not (local dev or race condition), it falls back to mocks.
 */
const runGAS = <T,>(functionName: string, ...args: any[]): Promise<T> => {
  return new Promise<T>((resolve, reject) => {
    // Check if we are in the real Google Apps Script environment
    if (typeof google !== 'undefined' && google.script && google.script.run) {
        console.log(`[GAS] Calling ${functionName} with`, args);
        google.script.run
        .withSuccessHandler((response: T) => {
            console.log(`[GAS] Success ${functionName}:`, response);
            resolve(response);
        })
        .withFailureHandler((error: Error) => {
            console.error(`[GAS] Failed ${functionName}:`, error);
            reject(error);
        })
        [functionName](...args);
    } else {
        // Fallback to Mocks
        console.warn(`[DEV/OFFLINE] Calling mock for ${functionName}`);
        const mockFn = mockServerFunctions[functionName];
        if (mockFn) {
            // Simulate network delay
            setTimeout(() => {
                try {
                    const result = mockFn(...args);
                    resolve(result);
                } catch (e) {
                    reject(e);
                }
            }, 500);
        } else {
            reject(new Error(`Function ${functionName} not found in mocks.`));
        }
    }
  });
};

class GoogleSheetsService {
  
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
