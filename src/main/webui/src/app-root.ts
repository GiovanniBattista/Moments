import { LitElement, html, css } from 'lit';
import { customElement, state, query } from 'lit/decorators.js';
import type { FormMode, Moment } from './types.js';
import { apiClient } from './api-client.js';
import './moment-card.js';
import './moment-form-dialog.js';
import type { MomentFormDialog } from './moment-form-dialog.js';

type Section = { key: string; label: string; icon: string; moments: Moment[] };

@customElement('app-root')
export class AppRoot extends LitElement {
  @state() private _moments: Moment[] = [];
  @state() private _loading = true;
  @state() private _error = '';
  @state() private _deleting: number | null = null;

  @query('moment-form-dialog') private _dialog!: MomentFormDialog;

  private _refreshTimer: ReturnType<typeof setInterval> | null = null;

  static styles = css`
    :host {
      display: block;
      min-height: 100vh;
    }

    header {
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      color: #fff;
      padding: 48px 20px 36px;
      text-align: center;
    }
    .app-title {
      font-size: clamp(2rem, 8vw, 3rem);
      font-weight: 900;
      letter-spacing: -1.5px;
      margin-bottom: 8px;
    }
    .app-subtitle {
      font-size: 1rem;
      opacity: 0.85;
      margin-bottom: 28px;
    }
    .header-actions {
      display: flex;
      gap: 12px;
      justify-content: center;
      flex-wrap: wrap;
    }
    .btn-action {
      background: rgba(255, 255, 255, 0.15);
      border: 2px solid rgba(255, 255, 255, 0.4);
      color: #fff;
      border-radius: 14px;
      padding: 12px 20px;
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      backdrop-filter: blur(4px);
      transition: background 0.15s, transform 0.1s;
      font-family: inherit;
    }
    .btn-action:hover {
      background: rgba(255, 255, 255, 0.25);
      transform: translateY(-1px);
    }
    .btn-action:active { transform: scale(0.97); }

    main {
      max-width: 900px;
      margin: 0 auto;
      padding: 32px 16px 60px;
    }

    .error-banner {
      background: #fee2e2;
      border: 1px solid #fca5a5;
      border-radius: 14px;
      padding: 16px 20px;
      color: #991b1b;
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 24px;
    }
    .error-banner button {
      margin-left: auto;
      background: none;
      border: none;
      color: #991b1b;
      cursor: pointer;
      font-size: 0.9rem;
      font-weight: 600;
      text-decoration: underline;
      font-family: inherit;
    }

    .loading {
      text-align: center;
      padding: 60px 0;
      color: #9ca3af;
    }
    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid #e5e7eb;
      border-top-color: #6366f1;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
      margin: 0 auto 16px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .empty-state {
      text-align: center;
      padding: 80px 20px;
      color: #9ca3af;
    }
    .empty-icon { font-size: 4rem; margin-bottom: 16px; }
    .empty-title { font-size: 1.25rem; font-weight: 700; color: #374151; margin-bottom: 8px; }
    .empty-hint { font-size: 0.95rem; }

    section { margin-bottom: 40px; }
    .section-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 16px;
    }
    .section-icon { font-size: 1.3rem; }
    .section-title {
      font-size: 1.1rem;
      font-weight: 800;
      color: #1e1b4b;
      letter-spacing: -0.3px;
    }
    .section-count {
      background: #f3f4f6;
      color: #6b7280;
      border-radius: 20px;
      padding: 2px 10px;
      font-size: 0.8rem;
      font-weight: 600;
    }

    .cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 16px;
    }

    @media (max-width: 480px) {
      .cards-grid { grid-template-columns: 1fr; }
      header { padding: 36px 16px 28px; }
    }
  `;

  connectedCallback() {
    super.connectedCallback();
    this._loadMoments();
    this._refreshTimer = setInterval(() => this._loadMoments(), 60_000);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._refreshTimer) clearInterval(this._refreshTimer);
  }

  private async _loadMoments() {
    try {
      this._moments = await apiClient.getAll();
      this._error = '';
    } catch {
      this._error = 'Momente konnten nicht geladen werden. Bitte versuche es erneut.';
    } finally {
      this._loading = false;
    }
  }

  private _openCreate(mode: FormMode) {
    this._dialog.open(mode);
  }

  private _handleEdit(e: CustomEvent<Moment>) {
    this._dialog.open('edit', e.detail);
  }

  private async _handleDelete(e: CustomEvent<number>) {
    const id = e.detail;
    if (!confirm('Diesen Moment wirklich löschen?')) return;
    this._deleting = id;
    try {
      await apiClient.delete(id);
      this._moments = this._moments.filter(m => m.id !== id);
    } catch {
      this._error = 'Löschen fehlgeschlagen. Bitte versuche es erneut.';
    } finally {
      this._deleting = null;
    }
  }

  private _handleSaved(e: CustomEvent<Moment>) {
    const saved = e.detail;
    const idx = this._moments.findIndex(m => m.id === saved.id);
    if (idx >= 0) {
      this._moments = this._moments.map(m => m.id === saved.id ? saved : m);
    } else {
      this._moments = [...this._moments, saved];
    }
  }

  private _sections(): Section[] {
    const upcoming = this._moments.filter(m => m.status === 'UPCOMING' || m.status === 'TODAY')
      .sort((a, b) => a.sortKey.localeCompare(b.sortKey));
    const running = this._moments.filter(m => m.status === 'RUNNING')
      .sort((a, b) => a.sortKey.localeCompare(b.sortKey));
    const past = this._moments.filter(m => m.status === 'PAST')
      .sort((a, b) => b.sortKey.localeCompare(a.sortKey));

    return [
      { key: 'upcoming', label: 'Bevorstehend',  icon: '🗓',  moments: upcoming },
      { key: 'running',  label: 'Läuft seit',     icon: '⏱',  moments: running  },
      { key: 'past',     label: 'Vergangen',      icon: '📅',  moments: past     },
    ].filter(s => s.moments.length > 0);
  }

  render() {
    const sections = this._sections();
    const hasAny = this._moments.length > 0;

    return html`
      <header>
        <div class="app-title">✨ Moments</div>
        <div class="app-subtitle">Deine besonderen Momente auf einen Blick</div>
        <div class="header-actions">
          <button class="btn-action" @click=${() => this._openCreate('create-target')}>
            🗓 Moment planen
          </button>
          <button class="btn-action" @click=${() => this._openCreate('create-since')}>
            🚀 Moment starten
          </button>
        </div>
      </header>

      <main>
        ${this._error ? html`
          <div class="error-banner">
            ⚠️ ${this._error}
            <button @click=${() => this._loadMoments()}>Erneut laden</button>
          </div>
        ` : ''}

        ${this._loading ? html`
          <div class="loading">
            <div class="spinner"></div>
            <div>Momente werden geladen…</div>
          </div>
        ` : !hasAny ? html`
          <div class="empty-state">
            <div class="empty-icon">🌟</div>
            <div class="empty-title">Noch keine Momente</div>
            <div class="empty-hint">Plane deinen ersten Moment oder starte einen laufenden Moment.</div>
          </div>
        ` : sections.map(section => html`
          <section>
            <div class="section-header">
              <span class="section-icon">${section.icon}</span>
              <span class="section-title">${section.label}</span>
              <span class="section-count">${section.moments.length}</span>
            </div>
            <div class="cards-grid">
              ${section.moments.map(m => html`
                <moment-card
                  .moment=${m}
                  style="${this._deleting === m.id ? 'opacity:0.4;pointer-events:none' : ''}"
                  @edit=${this._handleEdit}
                  @delete=${this._handleDelete}
                ></moment-card>
              `)}
            </div>
          </section>
        `)}
      </main>

      <moment-form-dialog @saved=${this._handleSaved}></moment-form-dialog>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'app-root': AppRoot;
  }
}
