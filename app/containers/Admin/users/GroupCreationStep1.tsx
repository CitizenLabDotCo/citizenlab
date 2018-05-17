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
  flex: 1;
  flex-direction: column;
  padding: 85px 60px;
  align-items: center;

  .groupName {
    font-size: ${fontSize('xl')};
    font-weight: bold;
    text-align: center;
  }

  .groupDescription {
    flex: 1;
    text-align: center;
  }

  &.manual {
    background: ${colors.lightGreyishBlue};
  }
  &.rules {
    background: ${colors.background};
  }
`;

const GroupIcon = styled(Icon)`
  width: 4.5rem;
  height: 4.5rem;
  margin-bottom: 1rem;

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
import { IGroupData } from 'services/groups';

export interface Props {
  onOpenStep2: (groupType: IGroupData['attributes']['membership_type']) => void;
}
export interface State {}

export class GroupCreationStep1 extends React.PureComponent<Props, State> {
  constructor(props) {
    super(props);
    this.state = {};
  }

  createStep2Handler = (groupType: IGroupData['attributes']['membership_type']) => () => {
    this.props.onOpenStep2(groupType);
  }

  render() {
    return (
      <TypesWrapper>
        <GroupType className="manual">
          <GroupIcon name="database" />
          <p className="groupName">
            <FormattedMessage {...messages.step1TypeNameNormal} />
          </p>
          <p className="groupDescription">
            <FormattedMessage {...messages.step1TypeDescriptionNormal} />
          </p>
          <MoreInfoLink to=""><FormattedMessage {...messages.step1ReadMore} /></MoreInfoLink>
          <Step2Button onClick={this.createStep2Handler('manual')} circularCorners={false}>
            <FormattedMessage {...messages.step1CreateButtonNormal} />
          </Step2Button>
        </GroupType>
        <GroupType className="rules">
          <GroupIcon name="lightingBolt" />
          <p className="groupName">
            <FormattedMessage {...messages.step1TypeNameSmart} />
          </p>
          <p className="groupDescription">
            <FormattedMessage {...messages.step1TypeDescriptionSmart} />
          </p>
          <MoreInfoLink to=""><FormattedMessage {...messages.step1ReadMore} /></MoreInfoLink>
          <Step2Button onClick={this.createStep2Handler('rules')} circularCorners={false}>
            <FormattedMessage {...messages.step1CreateButtonSmart} />
          </Step2Button>
        </GroupType>
      </TypesWrapper>
    );
  }
}

export default GroupCreationStep1;
