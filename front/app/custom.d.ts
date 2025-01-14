declare module '*.woff';
declare module '*.woff2';
declare module "*.svg" {
  const content: any;
  export default content;
}
declare module '*.png' {
  const content: string
  export default content
}
declare module '*.jpg' {
  const content: string
  export default content
}

// TypeScript does not have built-in type definitions for Moment.js locale files under 'moment/dist/locale/*'.
// This custom declaration is required to avoid "Cannot find module" errors when dynamically importing locales.
// By declaring these modules with a generic type (`any`), we inform TypeScript that these files exist and can be safely imported.
declare module 'moment/dist/locale/*' {
  const locale: any;
  export default locale;
}
