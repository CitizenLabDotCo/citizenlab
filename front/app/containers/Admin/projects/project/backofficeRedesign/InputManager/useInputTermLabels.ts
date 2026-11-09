import usePhase from 'api/phases/usePhase';

import { useIntl } from 'utils/cl-intl';
import { useParams } from 'utils/router';

import inputTermMessages from './inputTermMessages';

// The words for an input in the current phase, from its naming option.
const useInputTermLabels = () => {
  const { formatMessage } = useIntl();
  const { phaseId } = useParams({ strict: false });
  const { data: phase } = usePhase(phaseId);
  const term = phase?.data.attributes.input_term ?? 'other';

  return {
    term: formatMessage(inputTermMessages.singular, { term }),
    terms: formatMessage(inputTermMessages.plural, { term }),
    capitalizedTerm: formatMessage(inputTermMessages.capitalizedSingular, {
      term,
    }),
    capitalizedTerms: formatMessage(inputTermMessages.capitalizedPlural, {
      term,
    }),
    termCount: (count: number) =>
      formatMessage(inputTermMessages.count, { term, count }),
  };
};

export default useInputTermLabels;
