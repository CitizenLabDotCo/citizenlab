import { useBreakpoint } from '@citizenlab/cl2-component-library';
import { TPreviewDevice } from 'components/admin/SelectPreviewDevice';

export default function useDevice() {
  const isPhone = useBreakpoint('phone');
  const isTablet = useBreakpoint('tablet');

  const device: TPreviewDevice = (() => {
    if (isPhone) return 'phone';
    if (isTablet) return 'tablet';
    return 'desktop';
  })();

  return device;
}
