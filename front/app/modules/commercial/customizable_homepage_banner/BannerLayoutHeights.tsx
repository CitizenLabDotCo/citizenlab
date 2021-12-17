import { useEffect } from 'react';

type Props = {
  onData: (data: Object) => void;
};

export const homepageBannerLayoutHeights = {
  two_column_layout: {
    desktop: 532,
    tablet: 532,
    phone: 240,
  },
  two_row_layout: {
    desktop: 280,
    tablet: 200,
    phone: 200,
  },
};

const BannerLayoutHeights = ({ onData }: Props) => {
  useEffect(() => {
    onData(homepageBannerLayoutHeights);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
};

export default BannerLayoutHeights;
