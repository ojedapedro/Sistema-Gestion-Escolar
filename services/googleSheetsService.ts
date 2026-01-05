
import { Representative, Student, Payment, Level, Grade, PaymentMethod, PaymentStatus } from '../types';

// This special 'google' object is injected by the Apps Script environment when the app is served.
declare const google: any;

// This block creates a mock 'google' object for local development
// if it doesn't already exist (i.e., when not running in Google Apps Script).
if (typeof google === 'undefined') {
  console.warn("ADVERTENCIA: El objeto 'google' no fue encontrado. Ejecutando en modo de desarrollo local con una API simulada. Los datos no se guardarán en Google Sheets.");

  // Define mock functions that simulate the backend (Code.gs)
  const serverMocks: { [key: string]: (...args: any[]) => any } = {
    getRepresentativeByCedula: (cedula: string) => {
      console.log('[MOCK] getRepresentativeByCedula', { cedula });
      if (cedula === '12345678') {
        return {
          cedula: '12345678',
          fullName: 'Juan Pérez (Simulado)',
          matricula: 'mat-2024-25-12345678',
          students: [{ id: 'uuid-sim-1', name: 'Ana Pérez', level: 'Primaria', grade: '3er Grado', section: 'B' }],
        };
      }
      return null;
    },
    addStudentAndRepresentative: (data: any) => {
      console.log('[MOCK] addStudentAndRepresentative', data);
      return {
        cedula: data.repCedula,
        fullName: data.repName,
        matricula: `mat-2024-25-${data.repCedula}`,
        students: [{ id: `uuid-sim-${Math.random()}`, name: data.studentName, level: data.level, grade: data.grade, section: data.section }],
      };
    },
    getPaymentsByStatus: (status: any) => {
       console.log('[MOCK] getPaymentsByStatus', { status });
       if(status.includes('pending-verification')) {
         return [
           { id: 'p-mock-1', paymentDate: '2024-07-29', representativeName: 'Maria Rodriguez (Simulado)', representativeCedula: '87654321', amount: 50, paymentMethod: 'Pago Móvil', reference: '0123456', status: 'pending-verification' },
           { id: 'p-mock-2', paymentDate: '2024-07-28', representativeName: 'Carlos Gomez (Simulado)', representativeCedula: '11223344', amount: 180, paymentMethod: 'Transferencia', reference: '987654', status: 'pending-verification' }
         ];
       }
       if(status.includes('approved')) {
         return [
           { id: 'p-mock-3', paymentDate: '2024-07-27', representativeName: 'Luisa Fernandez (Simulado)', representativeCedula: '55667788', amount: 200, paymentMethod: 'Zelle', reference: 'luisa@email.com', status: 'approved' }
         ]
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
      return { ...payment, id: `p-mock-${Math.random()}` };
    },
    getAllDataForReports: () => {
      console.log('[MOCK] getAllDataForReports');
      return { representatives: [], payments: [] };
    }
  };

  // Create a proxy to simulate the `google.script.run` object and its chained methods
  const createRunProxy = () => {
    let successHandler: (value: any) => void = () => {};
    let failureHandler: (error: Error) => void = () => {};

    const proxy: any = new Proxy({}, {
      get(target, prop: string) {
        if (prop === 'withSuccessHandler') {
          return (handler: any) => {
            successHandler = handler;
            return proxy;
          };
        }
        if (prop === 'withFailureHandler') {
          return (handler: any) => {
            failureHandler = handler;
            return proxy;
          };
        }
        // This is the actual server function call
        if (serverMocks[prop]) {
          return (...args: any[]) => {
            try {
              const result = serverMocks[prop](...args);
              // Run asynchronously to better mimic the real API
              setTimeout(() => successHandler(result), 300);
            } catch (error: any) {
              setTimeout(() => failureHandler(error), 300);
            }
          };
        }
        return undefined;
      },
    });
    return proxy;
  };

  // Assign the mock to the global window object
  (window as any).google = {
    script: {
      // A getter is used so a new proxy is created for each `google.script.run` call chain.
      get run() {
        return createRunProxy();
      }
    },
  };
}


/**
 * A helper function to wrap google.script.run calls in a Promise.
 * This makes the asynchronous calls easier to work with in the React app.
 * It will now work with both the real and the mocked `google` object.
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
    // The warning in the mock block will indicate if we are connected to the live backend or not.
    if(typeof google !== 'undefined' && google.script) {
        console.log("GoogleSheetsService initialized. Connecting to live backend.");
    }
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
