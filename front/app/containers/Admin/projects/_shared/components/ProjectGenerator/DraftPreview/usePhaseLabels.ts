import useLocale from 'hooks/useLocale';
import useLocalize from 'hooks/useLocalize';

import { PARTICIPATION_METHOD_LABELS } from 'containers/Admin/inspirationHub/constants';
import { formatDateRange } from 'containers/Admin/projects/project/projectPage/phaseRowUtils';

import { getLocale } from 'components/admin/DatePickers/_shared/locales';

import { useIntl } from 'utils/cl-intl';
import { htmlToPlainText } from 'utils/textUtils';

import { DraftPhase } from '../draft';
import messages from '../messages';

// The texts of a phase, for the saved phase and its proposed version alike.
const usePhaseLabels = () => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const locale = getLocale(useLocale());

  const descriptionOf = (phase: DraftPhase) =>
    htmlToPlainText(localize(phase.description)).trim();

  const methodOf = (phase: DraftPhase) =>
    formatMessage(PARTICIPATION_METHOD_LABELS[phase.method]);

  const datesOf = (phase: DraftPhase) =>
    formatDateRange(
      phase.startAt,
      phase.endAt,
      locale,
      formatMessage(messages.noEndDate)
    );

  return { descriptionOf, methodOf, datesOf };
};

export default usePhaseLabels;
