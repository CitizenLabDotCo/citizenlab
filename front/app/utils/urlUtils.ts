export const isYouTubeEmbedLink = (url?: string): boolean => {
  return !!url?.includes('youtube.com');
};
