import { RenderMode, ServerRoute } from '@angular/ssr';

// Server routes configuration
// In development (ssr: false), these routes are mostly for documentation
// In production (ssr: true), they define how routes should be pre-rendered
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
    renderMode: RenderMode.Prerender
  }
];
