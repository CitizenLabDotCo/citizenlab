import usePhase from 'api/phases/usePhase';

import inputTermMessages from 'containers/Admin/projects/project/inputTerm/messages';

import { useIntl } from 'utils/cl-intl';
import { useParams } from 'utils/router';

const useInputTermLabels = () => {
  const { formatMessage } = useIntl();
  const { phaseId } = useParams({ strict: false });
  const { data: phase } = usePhase(phaseId);
  const inputTerm = phase?.data.attributes.input_term ?? 'other';

  return {
    inputTerm,
    capitalizedTerm: formatMessage(inputTermMessages.capitalizedSingular, {
      term: inputTerm,
    }),
    capitalizedTerms: formatMessage(inputTermMessages.capitalizedPlural, {
      term: inputTerm,
    }),
    termCount: (count: number) =>
      formatMessage(inputTermMessages.count, { term: inputTerm, count }),
  };
};

export default useInputTermLabels;
