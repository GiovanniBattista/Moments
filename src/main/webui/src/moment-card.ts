import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { Moment } from './types.js';

const ACCENT_COLORS = [
  '#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899',
];

function nameToColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) % ACCENT_COLORS.length;
  }
  return ACCENT_COLORS[Math.abs(hash)];
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' });
}

@customElement('moment-card')
export class MomentCard extends LitElement {
  @property({ type: Object }) moment!: Moment;

  static styles = css`
    :host {
      display: block;
    }

    .card {
      background: #fff;
      border-radius: 20px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
      overflow: hidden;
      transition: transform 0.15s ease, box-shadow 0.15s ease;
    }
    .card:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
    }

    .card-accent {
      height: 6px;
    }

    .card-media {
      width: 100%;
      height: 160px;
      object-fit: cover;
      display: block;
    }

    .card-placeholder {
      width: 100%;
      height: 160px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 3.5rem;
      font-weight: 800;
      color: #fff;
      letter-spacing: -1px;
      user-select: none;
    }

    .card-body {
      padding: 20px;
    }

    .card-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 8px;
      margin-bottom: 10px;
    }

    .card-name {
      font-size: 1.1rem;
      font-weight: 700;
      color: #1e1b4b;
      line-height: 1.3;
    }

    .card-actions {
      display: flex;
      gap: 6px;
      flex-shrink: 0;
    }

    .btn-icon {
      background: none;
      border: none;
      cursor: pointer;
      padding: 6px;
      border-radius: 8px;
      font-size: 1rem;
      line-height: 1;
      transition: background 0.1s;
      color: #6b7280;
    }
    .btn-icon:hover {
      background: #f3f4f6;
      color: #374151;
    }
    .btn-icon.delete:hover {
      background: #fee2e2;
      color: #ef4444;
    }

    .display-text {
      font-size: 1.6rem;
      font-weight: 800;
      line-height: 1.2;
      margin-bottom: 10px;
      letter-spacing: -0.5px;
    }

    .status-upcoming  { color: #6366f1; }
    .status-today     { color: #059669; }
    .status-past      { color: #9ca3af; }
    .status-running   { color: #d97706; }

    .card-date {
      font-size: 0.85rem;
      color: #9ca3af;
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .card-description {
      font-size: 0.9rem;
      color: #6b7280;
      line-height: 1.5;
      border-top: 1px solid #f3f4f6;
      padding-top: 10px;
      margin-top: 4px;
    }

    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 0.7rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 3px 8px;
      border-radius: 20px;
      margin-bottom: 8px;
    }
    .badge-upcoming  { background: #ede9fe; color: #5b21b6; }
    .badge-today     { background: #d1fae5; color: #065f46; }
    .badge-past      { background: #f3f4f6; color: #6b7280; }
    .badge-running   { background: #fef3c7; color: #92400e; }
  `;

  private _handleEdit() {
    this.dispatchEvent(new CustomEvent('edit', { detail: this.moment, bubbles: true, composed: true }));
  }

  private _handleDelete() {
    this.dispatchEvent(new CustomEvent('delete', { detail: this.moment.id, bubbles: true, composed: true }));
  }

  private _renderMedia() {
    const { imageUrl, name, color } = this.moment;
    const accent = color || nameToColor(name);
    if (imageUrl) {
      return html`<img class="card-media" src="${imageUrl}" alt="${name}" loading="lazy" />`;
    }
    const initial = name.trim().charAt(0).toUpperCase();
    return html`
      <div class="card-placeholder" style="background: linear-gradient(135deg, ${accent}, ${accent}cc)">
        ${initial}
      </div>
    `;
  }

  private _badgeClass() {
    return `status-badge badge-${this.moment.status.toLowerCase()}`;
  }

  private _badgeLabel() {
    switch (this.moment.status) {
      case 'UPCOMING': return '🗓 Bevorstehend';
      case 'TODAY':    return '✨ Heute';
      case 'PAST':     return '📅 Vergangen';
      case 'RUNNING':  return '⏱ Läuft seit';
    }
  }

  private _displayTextClass() {
    return `display-text status-${this.moment.status.toLowerCase()}`;
  }

  render() {
    const { moment } = this;
    const accent = moment.color || nameToColor(moment.name);
    const dateLabel = moment.type === 'TARGET_DATE'
      ? formatDate(moment.targetDate)
      : formatDate(moment.startTime);

    return html`
      <div class="card">
        <div class="card-accent" style="background:${accent}"></div>
        ${this._renderMedia()}
        <div class="card-body">
          <div class="card-header">
            <div class="card-name">${moment.name}</div>
            <div class="card-actions">
              <button class="btn-icon" title="Bearbeiten" @click=${this._handleEdit}>✏️</button>
              <button class="btn-icon delete" title="Löschen" @click=${this._handleDelete}>🗑️</button>
            </div>
          </div>

          <div class="${this._badgeClass()}">${this._badgeLabel()}</div>
          <div class="${this._displayTextClass()}">${moment.displayText}</div>

          ${dateLabel ? html`
            <div class="card-date">
              <span>${moment.type === 'TARGET_DATE' ? '📆' : '🚀'}</span>
              <span>${dateLabel}</span>
            </div>
          ` : ''}

          ${moment.description ? html`
            <div class="card-description">${moment.description}</div>
          ` : ''}
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'moment-card': MomentCard;
  }
}
