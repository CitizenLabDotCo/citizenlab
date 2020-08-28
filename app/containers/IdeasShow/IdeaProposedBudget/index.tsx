import React from 'react';
import { BodySectionTitle } from '..';
import Budget from './Budget';
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';
import useLocale from 'hooks/useLocale';
import { isNilOrError } from 'utils/helperUtils';
import useTenant from 'hooks/useTenant';

interface Props {
  proposedBudget: number;
}

const IdeaProposedBudget = ({ proposedBudget }: Props) => {
  const locale = useLocale();
  const tenant = useTenant();

  if (!isNilOrError(locale) && !isNilOrError(tenant)) {
    return (
      <>
        <BodySectionTitle>
          <FormattedMessage {...messages.proposedBudgetTitle} />
        </BodySectionTitle>

        <Budget
          proposedBudget={proposedBudget}
          locale={locale}
          tenant={tenant}
        />
      </>
    );
  }

  return null;
};

export default IdeaProposedBudget;
