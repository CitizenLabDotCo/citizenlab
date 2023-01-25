import { useBreakpoint } from '@citizenlab/cl2-component-library';
import { TDevice } from 'components/admin/SelectPreviewDevice';

export default function useDevice() {
  const isPhone = useBreakpoint('phone');
  const isTablet = useBreakpoint('tablet');

  const device: TDevice = (() => {
    if (isPhone) return 'phone';
    if (isTablet) return 'tablet';
    return 'desktop';
  })();

  return device;
}
