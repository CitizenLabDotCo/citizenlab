import usePhase from 'api/phases/usePhase';

import inputTermMessages from 'containers/Admin/projects/project/inputTermMessages';

import { useIntl } from 'utils/cl-intl';
import { useParams } from 'utils/router';

const useInputTermLabels = () => {
  const { formatMessage } = useIntl();
  const { phaseId } = useParams({ strict: false });
  const { data: phase } = usePhase(phaseId);
  const term = phase?.data.attributes.input_term ?? 'other';

  return {
    inputTerm: term,
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
