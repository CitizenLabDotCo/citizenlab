// Libraries
import React from 'react';
import { Link } from 'react-router';

// Components
import Icon from 'components/UI/Icon';
import Button from 'components/UI/Button';

// i18n
import FormattedMessage from 'utils/cl-intl/FormattedMessage';
import messages from './messages';

// Styling
import styled from 'styled-components';
import { colors, fontSize } from 'utils/styleUtils';
import { rgba } from 'polished';

const TypesWrapper = styled.div`
  display: flex;
  flex-wrap: nowrap;
  align-items: stretch;
`;

const GroupType = styled.div`
  display: flex;
  flex-direction: column;
  padding: 85px 65px;
  align-items: center;

  .groupName {
    font-size: ${fontSize('xl')};
    font-weight: 400;
  }

  .groupDescription {
    flex: 1;
  }
`;

const GroupIcon = styled(Icon)`
  width: 4.5rem;
  height: 4.5rem;

  .cl-icon-primary {
    fill: ${colors.adminTextColor};
  }

  .cl-icon-background {
    fill: ${rgba(colors.adminTextColor, .1)};
  }
`;

const MoreInfoLink = styled(Link)``;

const Step2Button = styled(Button)`
  margin-top: 60px;
`;

// Typings
export interface Props {}
export interface State {}

export class GroupCreationStep1 extends React.PureComponent<Props, State> {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <TypesWrapper>
        <GroupType>
          <GroupIcon />
          <FormattedMessage {...messages.step1TypeNameNormal} className="groupName" />
          <FormattedMessage {...messages.step1TypeDescriptionNormal} className="groupDescription" />
          <MoreInfoLink to=""><FormattedMessage {...messages.step1ReadMore} /></MoreInfoLink>
          <Step2Button />
        </GroupType>
        <GroupType>
          <GroupIcon />
          <FormattedMessage {...messages.step1TypeNameSmart} className="groupName" />
          <FormattedMessage {...messages.step1TypeDescriptionSmart} className="groupDescription" />
          <MoreInfoLink to=""><FormattedMessage {...messages.step1ReadMore} /></MoreInfoLink>
          <Step2Button />
        </GroupType>
      </TypesWrapper>
    );
  }
}

export default GroupCreationStep1;
