import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'books',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'books/:id',
    renderMode: RenderMode.Client
  }
];
