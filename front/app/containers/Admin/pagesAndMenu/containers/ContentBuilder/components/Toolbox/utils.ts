const releaseDateNewWidgets = new Date('2024-12-16');

export const platformCreatedBeforeReleaseNewWidgets = (
  creationDate: string
) => {
  return new Date(creationDate) < releaseDateNewWidgets;
};
