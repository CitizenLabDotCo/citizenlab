import { CLLocale } from 'typings';

import { useIntl } from 'utils/cl-intl';

export default function useLocale() {
  const { locale } = useIntl();
  return locale as CLLocale;
}
