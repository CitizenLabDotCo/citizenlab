interface Params {
  smallerThanPhone: boolean;
  smallerThanTablet: boolean;
}

export const getReportWidth = ({
  smallerThanPhone,
  smallerThanTablet,
}: Params) => {
  if (smallerThanPhone) return 'mobile';
  if (smallerThanTablet) return 'tablet';
  return 'desktop';
};
