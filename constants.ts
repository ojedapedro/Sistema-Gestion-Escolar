
import { Level } from './types';

export const SCHOOL_LEVELS = Object.values(Level);

export const GRADES_BY_LEVEL: Record<Level, string[]> = {
  [Level.MATERNAL]: ['Único'],
  [Level.PREESCOLAR]: ['1er Nivel', '2do Nivel', '3er Nivel'],
  [Level.PRIMARIA]: ['1er Grado', '2do Grado', '3er Grado', '4to Grado', '5to Grado', '6to Grado'],
  [Level.SECUNDARIA]: ['1er Año', '2do Año', '3er Año', '4to Año', '5to Año'],
};

export const MONTHLY_FEES: Record<Level, number> = {
  [Level.MATERNAL]: 150,
  [Level.PREESCOLAR]: 180,
  [Level.PRIMARIA]: 200,
  [Level.SECUNDARIA]: 220,
};

export const PAYMENT_METHODS = [
    'Pago Móvil',
    'Transferencia',
    'Zelle',
    'Efectivo Bs.',
    'Efectivo $',
    'Efectivo €',
    'TDC',
    'TDD',
];

export const MONTHS = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];
