export interface User {
  _id: string;
  id?: string;
  name: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
  avatar?: string;
  department: string;
  studentId?: string;
  phone?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Course {
  _id: string;
  name: string;
  code: string;
  description: string;
  teacher: User;
  students?: User[];
  schedule?: {
    day: string;
    startTime: string;
    endTime: string;
    room: string;
  }[];
  resources?: Resource[];
  assignments?: Assignment[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Assignment {
  _id: string;
  title: string;
  description: string;
  course: Course | string;
  teacher: User | string;
  dueDate: string;
  points: number;
  submissions?: Submission[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Submission {
  _id: string;
  student: User | string;
  file?: string;
  submittedAt: string;
  grade?: number;
  feedback?: string;
  gradedAt?: string;
  gradedBy?: User | string;
}

export interface Resource {
  _id: string;
  title: string;
  description: string;
  file: string;
  uploadedAt: string;
  uploadedBy: User | string;
}

