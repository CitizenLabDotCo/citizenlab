import { format, isSameDay } from 'date-fns';

import useLocale from 'hooks/useLocale';
import useLocalize from 'hooks/useLocalize';

import { getLocale } from 'components/admin/DatePickers/_shared/locales';

import { useIntl } from 'utils/cl-intl';

import { DraftEvent } from '../draft';
import messages from '../messages';

// The texts of an event, saved or proposed.
const useEventLabels = () => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const locale = getLocale(useLocale());

  const timeOf = (event: DraftEvent) => {
    const start = new Date(event.startAt);
    const end = new Date(event.endAt);

    return isSameDay(start, end)
      ? `${format(start, 'EEE d MMM, p', { locale })} – ${format(end, 'p', {
          locale,
        })}`
      : `${format(start, 'd MMM, p', { locale })} – ${format(end, 'd MMM, p', {
          locale,
        })}`;
  };

  const placeOf = (event: DraftEvent) =>
    localize(event.location) ||
    event.address ||
    (event.onlineLink ? formatMessage(messages.online) : '');

  return { timeOf, placeOf };
};

export default useEventLabels;
