import React, { memo } from 'react';
import FormattedBudget from 'utils/currency/FormattedBudget';

// styling
import styled from 'styled-components';
import { media } from 'utils/styleUtils';

const Container = styled.div`
  color: ${(props) => props.theme.colors.tenantText};
  font-size: ${(props) => props.theme.fontSizes.l}px;
  line-height: 29px; // same line-height as Body's content
  font-weight: 300;

  ${media.phone`
    font-size: ${(props) => props.theme.fontSizes.base}px;
  `}
`;

interface Props {
  className?: string;
  proposedBudget: number;
}

const IdeaProposedBudget = memo<Props>(({ className, proposedBudget }) => {
  return (
    <Container className={className}>
      <FormattedBudget value={proposedBudget} />
    </Container>
  );
});

export default IdeaProposedBudget;
