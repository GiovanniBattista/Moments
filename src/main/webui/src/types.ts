export type MomentType = 'TARGET_DATE' | 'SINCE_DATE';
export type MomentStatus = 'UPCOMING' | 'TODAY' | 'PAST' | 'RUNNING';

export interface Moment {
  id: number;
  name: string;
  type: MomentType;
  targetDate?: string;
  startTime?: string;
  imageUrl?: string;
  description?: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
  status: MomentStatus;
  displayText: string;
  sortKey: string;
}

export interface CreateTargetDateRequest {
  name: string;
  targetDate: string;
  imageUrl?: string;
  description?: string;
  color?: string;
}

export interface CreateSinceDateRequest {
  name: string;
  startTime?: string;
  imageUrl?: string;
  description?: string;
  color?: string;
}

export interface UpdateMomentRequest {
  name: string;
  targetDate?: string;
  startTime?: string;
  imageUrl?: string;
  description?: string;
  color?: string;
}

export type FormMode = 'create-target' | 'create-since' | 'edit';
