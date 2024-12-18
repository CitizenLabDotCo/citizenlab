const releaseDateNewWidgets = new Date('2024-11-16');

export const platformCreatedBeforeReleaseNewWidgets = (
  creationDate: string
) => {
  return new Date(creationDate) < releaseDateNewWidgets;
};
