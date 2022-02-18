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

const IdeaIcon = styled(Icon)`
  flex: 0 0 30px;
  width: 30px;
  height: 30px;
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
  color: ${({ theme }) => theme.colorText};
  font-size: ${fontSizes.xl}px;
  font-weight: 500;
  line-height: normal;
  text-align: center;
  margin-top: 15px;
`;

// could be reused if we come up with better copy
// https://citizenlab.atlassian.net/browse/EN-1859

// const EmptyMessageSubLine = styled.div`
//   color: ${colors.label};
//   font-size: ${fontSizes.base}px;
//   font-weight: 300;
//   line-height: normal;
//   text-align: center;
//   margin-top: 10px;
// `;

const EmptyIdeas = () => {
  return (
    <EmptyContainer>
      <EmptyContainerInner>
        <IdeaIcon name="idea" ariaHidden />
        <EmptyMessage>
          <EmptyMessageMainLine>
            <FormattedMessage {...messages.noFilteredResults} />
          </EmptyMessageMainLine>
        </EmptyMessage>
      </EmptyContainerInner>
    </EmptyContainer>
  );
};

export default EmptyIdeas;
