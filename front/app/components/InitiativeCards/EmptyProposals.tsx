import React from 'react';
import styled from 'styled-components';
import { colors, fontSizes, defaultCardStyle } from 'utils/styleUtils';
import { Icon } from '@citizenlab/cl2-component-library';
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

const EmptyContainer = styled.div`
  flex: 1;
  width: 100%;
  display: flex;
  justify-content: center;
  ${defaultCardStyle};
`;

const EmptyContainerInner = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-left: 30px;
  padding-right: 30px;
  padding-top: 100px;
  padding-bottom: 100px;
`;

const InitiativeIcon = styled(Icon)`
  flex: 0 0 48px;
  width: 48px;
  height: 48px;
  fill: ${colors.label};
`;

const EmptyMessage = styled.div`
  max-width: 400px;
  color: ${colors.label};
  font-size: ${fontSizes.base}px;
  font-weight: 400;
  line-height: normal;
  text-align: center;
  margin-top: 10px;
`;

const EmptyMessageMainLine = styled.div`
  color: ${colors.text};
  font-size: ${fontSizes.xl}px;
  font-weight: 500;
  line-height: normal;
  text-align: center;
  margin-top: 15px;
`;

const EmptyMessageSubLine = styled.div`
  color: ${colors.label};
  font-size: ${fontSizes.base}px;
  font-weight: 300;
  line-height: normal;
  text-align: center;
  margin-top: 10px;
`;

const EmptyProposals = () => {
  return (
    <EmptyContainer className="e2e-initiative-cards-empty">
      <EmptyContainerInner>
        <InitiativeIcon name="initiatives" />
        <EmptyMessage>
          <EmptyMessageMainLine>
            <FormattedMessage {...messages.noInitiativesForFilter} />
          </EmptyMessageMainLine>
          <EmptyMessageSubLine>
            <FormattedMessage {...messages.tryOtherFilter} />
          </EmptyMessageSubLine>
        </EmptyMessage>
      </EmptyContainerInner>
    </EmptyContainer>
  );
};

export default EmptyProposals;
