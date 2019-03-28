import React from 'react';
import styled from 'styled-components';

import messages from '../../messages';
import { FormattedMessage } from 'utils/cl-intl';
import Icon from 'components/UI/Icon';
import { colors, fontSizes } from 'utils/styleUtils';
import { darken } from 'polished';

const NoIdeasPage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: ${fontSizes.xl}px;
  font-weight: bold;
  line-height: 25px;
  padding-top: 80px;
  svg {
    margin-bottom: 20px;
    height: 70px;
    fill: ${colors.clIconAccent}
  }
`;

const SFormattedMessage = styled.div`
  color: ${colors.adminSecondaryTextColor};
  font-weight: 400;
  font-size: ${fontSizes.base}px;

  button {
    color: ${colors.adminSecondaryTextColor};
    font-weight: bold;
    text-decoration: underline;
    outline: none;

    &:hover {
      color: ${darken(0.2, colors.adminSecondaryTextColor)};
    }
  }
`;

interface Props {
  handleSeeAllIdeas: () => void;
}

export default (props: Props) => (
  <NoIdeasPage>
    <Icon name="blankPage" />
    <FormattedMessage {...messages.noIdeasHere} />
      <SFormattedMessage>
        <FormattedMessage
          {...messages.resetFilters}
          values={{
            allIdeasLink: (
              <button onClick={props.handleSeeAllIdeas}>
                <FormattedMessage {...messages.allTheIdeas} />
              </button>),
          }}
        />
      </SFormattedMessage>
  </NoIdeasPage>
);
