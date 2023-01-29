export const generateEmptyData = (
  statusChanged: string,
  officialUpdate: string
) => {
  return [
    {
      name: statusChanged,
      label: `${statusChanged}: - (-%)`,
      value: 0,
      total: 1,
    },
    {
      name: officialUpdate,
      label: `${officialUpdate}: - (-%)`,
      value: 0,
      total: 1,
    },
  ];
};
