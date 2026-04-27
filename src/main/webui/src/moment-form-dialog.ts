import { LitElement, html, css } from 'lit';
import { customElement, property, state, query } from 'lit/decorators.js';
import type { FormMode, Moment } from './types.js';
import { apiClient } from './api-client.js';

const PRESET_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444',
  '#f59e0b', '#10b981', '#06b6d4', '#3b82f6',
];

/** Convert an ISO instant string to the value format required by <input type="datetime-local"> */
function toDatetimeLocal(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  // Shift by timezone offset so the local wall-clock time appears in the input
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

/** Convert a datetime-local input value back to an ISO UTC string */
function fromDatetimeLocal(local: string): string {
  if (!local) return '';
  return new Date(local).toISOString();
}

@customElement('moment-form-dialog')
export class MomentFormDialog extends LitElement {
  @property({ type: String }) mode: FormMode = 'create-target';
  @property({ type: Object }) editMoment: Moment | null = null;

  @state() private _open = false;
  @state() private _saving = false;
  @state() private _error = '';
  @state() private _name = '';
  @state() private _targetDate = '';
  @state() private _startTimeLocal = '';
  @state() private _imageUrl = '';
  @state() private _description = '';
  @state() private _color = '';

  @query('dialog') private _dialog!: HTMLDialogElement;

  static styles = css`
    dialog {
      border: none;
      border-radius: 24px;
      padding: 0;
      width: min(480px, 96vw);
      max-height: 92vh;
      overflow-y: auto;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
      overscroll-behavior: contain;
    }
    dialog::backdrop {
      background: rgba(15, 15, 30, 0.5);
      backdrop-filter: blur(4px);
    }

    .dialog-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 24px 24px 0;
    }
    .dialog-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: #1e1b4b;
    }
    .btn-close {
      background: #f3f4f6;
      border: none;
      cursor: pointer;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      font-size: 1.1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.1s;
    }
    .btn-close:hover { background: #e5e7eb; }

    .dialog-body {
      padding: 20px 24px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .field {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    label {
      font-size: 0.875rem;
      font-weight: 600;
      color: #374151;
    }
    .required::after {
      content: ' *';
      color: #ef4444;
    }
    input, textarea {
      border: 1.5px solid #e5e7eb;
      border-radius: 10px;
      padding: 10px 14px;
      font-size: 1rem;
      font-family: inherit;
      color: #1e1b4b;
      background: #fafafa;
      transition: border-color 0.15s;
      outline: none;
    }
    input:focus, textarea:focus {
      border-color: #6366f1;
      background: #fff;
    }
    textarea {
      resize: vertical;
      min-height: 80px;
    }

    .color-picker {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      align-items: center;
    }
    .color-swatch {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: 3px solid transparent;
      cursor: pointer;
      transition: transform 0.1s, border-color 0.1s;
      flex-shrink: 0;
    }
    .color-swatch:hover { transform: scale(1.15); }
    .color-swatch.selected { border-color: #1e1b4b; transform: scale(1.1); }
    .color-custom {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: 1.5px dashed #d1d5db;
      padding: 0;
      cursor: pointer;
      overflow: hidden;
    }

    .hint {
      font-size: 0.8rem;
      color: #9ca3af;
    }
    .info-hint {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: 10px;
      padding: 10px 14px;
      font-size: 0.875rem;
      color: #166534;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .info-hint.blue {
      background: #eff6ff;
      border-color: #bfdbfe;
      color: #1e40af;
    }

    .error-banner {
      background: #fee2e2;
      border-radius: 10px;
      padding: 10px 14px;
      font-size: 0.875rem;
      color: #991b1b;
    }

    .dialog-footer {
      padding: 0 24px 24px;
      display: flex;
      gap: 10px;
      justify-content: flex-end;
    }
    .btn {
      padding: 11px 24px;
      border-radius: 12px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      border: none;
      transition: opacity 0.15s, transform 0.1s;
    }
    .btn:active { transform: scale(0.97); }
    .btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-ghost {
      background: #f3f4f6;
      color: #374151;
    }
    .btn-ghost:hover { background: #e5e7eb; }
    .btn-primary {
      background: #6366f1;
      color: #fff;
    }
    .btn-primary:hover { background: #4f46e5; }
  `;

  open(mode: FormMode, moment?: Moment) {
    this.mode = mode;
    this.editMoment = moment ?? null;
    this._error = '';

    if (moment) {
      this._name = moment.name;
      this._targetDate = moment.targetDate ?? '';
      this._startTimeLocal = toDatetimeLocal(moment.startTime);
      this._imageUrl = moment.imageUrl ?? '';
      this._description = moment.description ?? '';
      this._color = moment.color ?? '';
    } else {
      this._name = '';
      this._targetDate = '';
      this._startTimeLocal = '';
      this._imageUrl = '';
      this._description = '';
      this._color = '';
    }

    this._open = true;
    this.updateComplete.then(() => this._dialog?.showModal());
  }

  close() {
    this._dialog?.close();
    this._open = false;
  }

  private async _handleSubmit(e: Event) {
    e.preventDefault();
    this._error = '';

    if (!this._name.trim()) {
      this._error = 'Bitte gib einen Namen ein.';
      return;
    }
    const isTargetType = this.mode === 'create-target' ||
      (this.mode === 'edit' && this.editMoment?.type === 'TARGET_DATE');
    if (isTargetType && !this._targetDate) {
      this._error = 'Bitte wähle ein Datum.';
      return;
    }

    this._saving = true;
    try {
      const common = {
        name: this._name.trim(),
        imageUrl: this._imageUrl.trim() || undefined,
        description: this._description.trim() || undefined,
        color: this._color || undefined,
      };

      let result;
      if (this.mode === 'edit' && this.editMoment) {
        const startTime = this.editMoment.type === 'SINCE_DATE' && this._startTimeLocal
          ? fromDatetimeLocal(this._startTimeLocal)
          : undefined;
        result = await apiClient.update(this.editMoment.id, {
          ...common,
          targetDate: this._targetDate || undefined,
          startTime,
        });
      } else if (this.mode === 'create-target') {
        result = await apiClient.createTargetDate({ ...common, targetDate: this._targetDate });
      } else {
        result = await apiClient.createSinceDate(common);
      }

      this.dispatchEvent(new CustomEvent('saved', { detail: result, bubbles: true, composed: true }));
      this.close();
    } catch (err) {
      this._error = err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten.';
    } finally {
      this._saving = false;
    }
  }

  private _title(): string {
    if (this.mode === 'edit') return '✏️ Moment bearbeiten';
    if (this.mode === 'create-target') return '🗓 Moment planen';
    return '🚀 Moment starten';
  }

  render() {
    if (!this._open) return html`<dialog></dialog>`;

    const isTargetType = this.mode === 'create-target' ||
      (this.mode === 'edit' && this.editMoment?.type === 'TARGET_DATE');
    const isSinceEdit = this.mode === 'edit' && this.editMoment?.type === 'SINCE_DATE';

    return html`
      <dialog @close=${() => { this._open = false; }}>
        <div class="dialog-header">
          <span class="dialog-title">${this._title()}</span>
          <button class="btn-close" @click=${this.close} title="Schließen">✕</button>
        </div>

        <form class="dialog-body" @submit=${this._handleSubmit}>
          ${this._error ? html`<div class="error-banner">⚠️ ${this._error}</div>` : ''}

          <div class="field">
            <label class="required" for="f-name">Name</label>
            <input
              id="f-name"
              type="text"
              placeholder="${isTargetType ? 'z. B. Kreuzfahrt Mittelmeer' : 'z. B. Neue Gewohnheit: Joggen'}"
              .value=${this._name}
              @input=${(e: Event) => { this._name = (e.target as HTMLInputElement).value; }}
              maxlength="255"
              autocomplete="off"
            />
          </div>

          ${isTargetType ? html`
            <div class="field">
              <label class="required" for="f-date">Datum</label>
              <input
                id="f-date"
                type="date"
                .value=${this._targetDate}
                @input=${(e: Event) => { this._targetDate = (e.target as HTMLInputElement).value; }}
              />
            </div>
          ` : isSinceEdit ? html`
            <div class="field">
              <label for="f-starttime">Gestartet am</label>
              <input
                id="f-starttime"
                type="datetime-local"
                .value=${this._startTimeLocal}
                @input=${(e: Event) => { this._startTimeLocal = (e.target as HTMLInputElement).value; }}
              />
              <span class="hint">Leer lassen, um den Startzeitpunkt unverändert zu behalten.</span>
            </div>
          ` : html`
            <div class="info-hint">
              ⏱ Der Startzeitpunkt wird automatisch auf jetzt gesetzt.
            </div>
          `}

          <div class="field">
            <label for="f-image">Bild-URL <span class="hint">(optional)</span></label>
            <input
              id="f-image"
              type="text"
              placeholder="https://example.com/bild.jpg"
              .value=${this._imageUrl}
              @input=${(e: Event) => { this._imageUrl = (e.target as HTMLInputElement).value; }}
            />
          </div>

          <div class="field">
            <label for="f-desc">Beschreibung <span class="hint">(optional)</span></label>
            <textarea
              id="f-desc"
              placeholder="Kurze Beschreibung dieses Moments…"
              .value=${this._description}
              @input=${(e: Event) => { this._description = (e.target as HTMLTextAreaElement).value; }}
              maxlength="1000"
            ></textarea>
          </div>

          <div class="field">
            <label>Farbe <span class="hint">(optional)</span></label>
            <div class="color-picker">
              ${PRESET_COLORS.map(c => html`
                <button
                  type="button"
                  class="color-swatch ${this._color === c ? 'selected' : ''}"
                  style="background:${c}"
                  title="${c}"
                  @click=${() => { this._color = this._color === c ? '' : c; }}
                ></button>
              `)}
              <input
                type="color"
                class="color-custom"
                .value=${this._color || '#6366f1'}
                title="Eigene Farbe"
                @input=${(e: Event) => { this._color = (e.target as HTMLInputElement).value; }}
              />
            </div>
          </div>
        </form>

        <div class="dialog-footer">
          <button class="btn btn-ghost" @click=${this.close} ?disabled=${this._saving}>
            Abbrechen
          </button>
          <button
            class="btn btn-primary"
            @click=${this._handleSubmit}
            ?disabled=${this._saving}
          >
            ${this._saving ? '…' : (this.mode === 'edit' ? 'Speichern' : 'Erstellen')}
          </button>
        </div>
      </dialog>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'moment-form-dialog': MomentFormDialog;
  }
}
