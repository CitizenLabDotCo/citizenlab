import React, { useMemo } from 'react';

// api
import useProjectById from 'api/projects/useProjectById';
import usePhases from 'api/phases/usePhases';
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useBasket from 'api/baskets/useBasket';

// i18n
import useLocalize from 'hooks/useLocalize';
import { useIntl } from 'utils/cl-intl';
import messages from './messages';

// utils
import { getCurrentPhase, getLastPhase } from 'api/phases/utils';

interface Props {
  projectId: string;
}

const VotesBudget = ({ projectId }: Props) => {
  const { data: project } = useProjectById(projectId);
  const { data: phases } = usePhases(projectId);
  const { data: appConfig } = useAppConfiguration();

  const localize = useLocalize();
  const { formatMessage } = useIntl();

  const currentPhase = useMemo(() => {
    return getCurrentPhase(phases?.data) || getLastPhase(phases?.data);
  }, [phases]);

  const basketId = currentPhase
    ? currentPhase.relationships.user_basket?.data?.id
    : project?.data.relationships.user_basket?.data?.id;

  const { data: basket } = useBasket(basketId);

  const getVoteTerm = () => {
    if (currentPhase?.attributes.voting_term_plural_multiloc) {
      return localize(currentPhase.attributes.voting_term_plural_multiloc);
    } else if (project?.data.attributes.voting_term_plural_multiloc) {
      return localize(
        project.data.attributes.voting_term_plural_multiloc
      ).toLowerCase();
    }
    return null;
  };

  const maxBudget =
    currentPhase?.attributes.voting_max_total ||
    project?.data.attributes.voting_max_total ||
    0;

  return (
    <>
      {(
        maxBudget - (basket?.data.attributes.total_votes || 0)
      ).toLocaleString()}{' '}
      / {maxBudget.toLocaleString()}{' '}
      {getVoteTerm() || appConfig?.data.attributes.settings.core.currency}{' '}
      {formatMessage(messages.left)}
    </>
  );
};

export default VotesBudget;
