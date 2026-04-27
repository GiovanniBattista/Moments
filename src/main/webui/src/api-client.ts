import type {
  CreateSinceDateRequest,
  CreateTargetDateRequest,
  Moment,
  UpdateMomentRequest,
} from './types.js';

const BASE = '/api/moments';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `HTTP ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const apiClient = {
  getAll(): Promise<Moment[]> {
    return fetch(BASE).then(handleResponse<Moment[]>);
  },

  getById(id: number): Promise<Moment> {
    return fetch(`${BASE}/${id}`).then(handleResponse<Moment>);
  },

  createTargetDate(data: CreateTargetDateRequest): Promise<Moment> {
    return fetch(`${BASE}/target-date`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handleResponse<Moment>);
  },

  createSinceDate(data: CreateSinceDateRequest): Promise<Moment> {
    return fetch(`${BASE}/since-date`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handleResponse<Moment>);
  },

  update(id: number, data: UpdateMomentRequest): Promise<Moment> {
    return fetch(`${BASE}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handleResponse<Moment>);
  },

  delete(id: number): Promise<void> {
    return fetch(`${BASE}/${id}`, { method: 'DELETE' }).then(handleResponse<void>);
  },
};
