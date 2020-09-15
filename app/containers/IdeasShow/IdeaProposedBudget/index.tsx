import React from 'react';
import styled from 'styled-components';
import { BodySectionTitle } from '..';
import Budget from './Budget';
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';
import useLocale from 'hooks/useLocale';
import { isNilOrError } from 'utils/helperUtils';
import useTenant from 'hooks/useTenant';

interface Props {
  className?: string;
  proposedBudget: number;
}

const Container = styled.div``;

const IdeaProposedBudget = ({ proposedBudget, className }: Props) => {
  const locale = useLocale();
  const tenant = useTenant();

  if (!isNilOrError(locale) && !isNilOrError(tenant)) {
    return (
      <Container className={className}>
        <BodySectionTitle>
          <FormattedMessage {...messages.proposedBudgetTitle} />
        </BodySectionTitle>

        <Budget
          proposedBudget={proposedBudget}
          locale={locale}
          tenant={tenant}
        />
      </Container>
    );
  }

  return null;
};

export default IdeaProposedBudget;
