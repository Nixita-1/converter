import { Component, effect, signal, computed, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api';

@Component({
  selector: 'app-image-to-text',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './image-to-text.html',
  styleUrl: './image-to-text.scss',
})
export class ImageToTextComponent implements OnDestroy {
  readonly file = signal<File | null>(null);
  readonly previewUrl = signal<string | null>(null);
  readonly extractedText = signal<string>('');
  readonly error = signal<string | null>(null);
  readonly loading = signal<boolean>(false);

  readonly fileName = computed(() => this.file()?.name ?? '');
  readonly fileSizeKb = computed(() =>
    this.file() ? Math.round(this.file()!.size / 1024) : 0
  );

  private urlToRevoke: string | null = null;

  constructor(private api: ApiService) {
    effect(() => {
      const f = this.file();
      if (this.urlToRevoke) {
        URL.revokeObjectURL(this.urlToRevoke);
        this.urlToRevoke = null;
      }
      if (f) {
        const url = URL.createObjectURL(f);
        this.previewUrl.set(url);
        this.urlToRevoke = url;
      } else {
        this.previewUrl.set(null);
      }
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const selected = input.files?.[0] ?? null;

    this.error.set(null);
    this.extractedText.set('');

    if (!selected) {
      this.file.set(null);
      return;
    }

    const validTypes = ['image/png', 'image/jpeg'];
    if (!validTypes.includes(selected.type)) {
      this.error.set('JPEG or PNG only');
      this.file.set(null);
      return;
    }

    const maxBytes = 2 * 1024 * 1024;
    if (selected.size > maxBytes) {
      this.error.set('max 2 MB');
      this.file.set(null);
      return;
    }

    this.file.set(selected);
  }

  extractText() {
    const f = this.file();
    if (!f) {
      this.error.set('load a file first');
      return;
    }

    this.loading.set(true);
    this.error.set(null);
    this.extractedText.set('');

    this.api.uploadImageToText(f).subscribe({
      next: (text) => {
        this.extractedText.set(text || 'text is not recognised');
        this.loading.set(false);
      },
      error: (err) => {
        const msg =
          err?.error?.message || err?.message || 'error on extracting text';
        this.error.set(msg);
        this.loading.set(false);
      },
    });
  }

  copyText() {
    const text = this.extractedText();

    if (!text) {
      return
    }

    navigator.clipboard.writeText(text).catch(() => {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    });
  }

  clear() {
    this.file.set(null);
    this.extractedText.set('');
    this.error.set(null);
    this.loading.set(false);
  }

  ngOnDestroy(): void {
    if (this.urlToRevoke) {
      URL.revokeObjectURL(this.urlToRevoke);
      this.urlToRevoke = null;
    }
  }
}
