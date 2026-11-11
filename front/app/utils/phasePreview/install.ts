import { installPhasePreview } from './runtime';

// Imported for its side effect before the rest of the app, so the preview's
// write barrier is in place before any other module can make a request.
installPhasePreview();
