export const isYouTubeEmbedLink = (url: string | undefined): boolean => {
  return url?.includes('youtube.com') ?? false;
};
