import React from 'react';
import styled from 'styled-components';

// i18n
import messages from '../../messages';
import { FormattedMessage } from 'utils/cl-intl';

// styling
import { colors, fontSizes } from 'utils/styleUtils';

// components
import Button from 'components/UI/Button';
import Icon from 'components/UI/Icon';

const NoIdeasPage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: ${fontSizes.base}px;
  font-weight: bold;
  line-height: 25px;
  padding-top: 80px;
  padding-bottom: 100px;
  width: 100%;

  border: 1px solid ${colors.separation};
  svg {
    margin-bottom: 20px;
    height: 50px;
    fill: ${colors.clIconAccent}
  }
`;

const NoIdeasHeader = styled.h2`
  font-size: ${fontSizes.xl}px;
  font-weight: 600;
  margin-top: 0;
  margin-bottom: 10px;
`;

const NoIdeasDescription = styled.p`
  color: ${colors.adminSecondaryTextColor};
  font-weight: 400;
  font-size: ${fontSizes.base}px;
  margin-bottom: 30px;
  max-width: 450px;
`;

interface Props {
  handleSeeAllIdeas: () => void;
}

export default (props: Props) => (
  <NoIdeasPage>
    <Icon name="blankPage" />
    <NoIdeasHeader>
      <FormattedMessage {...messages.noIdeasHere} />
    </NoIdeasHeader>
    <NoIdeasDescription>
      <FormattedMessage {...messages.resetFiltersDescription} />
    </NoIdeasDescription>
    <Button
      style="cl-blue"
      circularCorners={false}
      onClick={props.handleSeeAllIdeas}
    >
      <FormattedMessage {...messages.resetFiltersButton} />
    </Button>
  </NoIdeasPage>
);
