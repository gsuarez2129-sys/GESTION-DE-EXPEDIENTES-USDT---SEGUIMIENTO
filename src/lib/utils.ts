import { differenceInDays, differenceInHours, startOfDay, isBefore, isToday } from 'date-fns';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { StatusColor } from '../types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getStatusColor(fechaVencimiento: string): StatusColor {
  const now = new Date();
  const dueDate = new Date(fechaVencimiento);
  
  // Rojo: Tareas vencidas (fecha anterior a hoy)
  if (isBefore(dueDate, startOfDay(now))) {
    return 'red';
  }

  const diffHours = differenceInHours(dueDate, now);
  
  // Ámbar: Tareas próximas a vencer (dentro de las próximas 24 horas / 1 día)
  if (diffHours >= 0 && diffHours <= 24) {
    return 'amber';
  }

  // Verde: Tareas con plazo vigente (más de 24 horas)
  // Nota: Aunque el requerimiento inicial mencionaba 3 días, para no dejar vacíos 
  // en el semáforo, todo lo que no es Rojo o Ámbar se considera Verde (Vigente).
  return 'green';
}

export function getStatusLabel(color: StatusColor): string {
  switch (color) {
    case 'green': return 'Vigente';
    case 'amber': return 'Próximo (≤ 1 día)';
    case 'red': return 'Vencido';
  }
}
