import { format } from 'date-fns';

export type TaskCategory = 'critical' | 'administrative' | 'micro';

export interface Task {
  id: string;
  text: string;
  completed: boolean;
}

export interface DayPlan {
  critical: Task[];
  administrative: Task[];
  micro: Task[];
}

export interface UserData {
  [date: string]: DayPlan;
}

export const USERS = [
  'Ana', 'Claudia', 'Fran', 'Gra', 'Ilonka', 
  'Josue', 'Lina', 'Paty', 'Pauli', 'Sascha'
];

export const CATEGORIES: { id: TaskCategory; label: string; color: string; description: string }[] = [
  { 
    id: 'critical', 
    label: 'Tareas Críticas', 
    color: 'bg-latam-blue', 
    description: '3 tareas de alto impacto que requieren enfoque profundo.' 
  },
  { 
    id: 'administrative', 
    label: 'Tareas Administrativas', 
    color: 'bg-latam-red', 
    description: '3 tareas necesarias pero menos intensas.' 
  },
  { 
    id: 'micro', 
    label: 'Micro-gestiones', 
    color: 'bg-latam-gray', 
    description: '3 tareas rápidas de menos de 10 minutos.' 
  },
];

export const getStorageKey = (user: string) => `regla-333-data-${user}`;

export const loadUserData = (user: string): UserData => {
  const data = localStorage.getItem(getStorageKey(user));
  return data ? JSON.parse(data) : {};
};

export const saveUserData = (user: string, data: UserData) => {
  localStorage.setItem(getStorageKey(user), JSON.stringify(data));
};

export const getEmptyDayPlan = (): DayPlan => ({
  critical: [],
  administrative: [],
  micro: [],
});

export const formatDateKey = (date: Date) => format(date, 'yyyy-MM-dd');
