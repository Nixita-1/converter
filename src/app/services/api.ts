import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ImageToTextResponse } from '../types/types';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'https://api.api-ninjas.com/v1';
  private readonly apiKey = 'KtXBKekdL+IhvalWAzUz7g==hw2EuwUKnlQHo7vC';

  uploadImageToText(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('image', file);

    const headers = new HttpHeaders({
      'X-Api-Key': this.apiKey,
    });

    return this.http
      .post<ImageToTextResponse>(`${this.baseUrl}/imagetotext`, formData, {
        headers,
      })
      .pipe(
        map((blocks) => {
          if (!blocks || blocks.length === 0) {
            return '';
          }
          const sorted = [...blocks].sort((a, b) =>
            a.y === b.y ? a.x - b.x : a.y - b.y
          );
          return sorted
            .map((b) => b.text)
            .join('\n')
            .trim();
        })
      );
  }
}
