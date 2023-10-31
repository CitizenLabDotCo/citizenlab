import { useIntl } from 'utils/cl-intl';
import { Locale } from 'typings';

export default function useLocale() {
  const { locale } = useIntl();
  return locale as Locale;
}
