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