// Libraries
import React from 'react';

// Components
import Icon from 'components/UI/Icon';
import Button from 'components/UI/Button';

// i18n
import FormattedMessage from 'utils/cl-intl/FormattedMessage';
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

// Styling
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';
import { darken } from 'polished';

const Container = styled.div`
  display: flex;
`;

const GroupType = styled.div`
  width: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-left: 20px;
  padding-right: 20px;
  padding-top: 50px;
  padding-bottom: 50px;

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
`;

const GroupName = styled.p`
  color: ${colors.adminTextColor};
  font-size: ${fontSizes.xl}px;
  font-weight: 600;
`;

const GroupDescription = styled.div`
  min-height: 100px;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 30px;
`;

const DescriptionText = styled.div`
  width: 285px;
  color: ${colors.adminTextColor};
  text-align: center;
`;

const MoreInfoLink = styled.a`
  color: ${colors.clBlueDark};
  text-align: center;
  text-decoration: underline;
  margin-top: 10px;

  &:hover {
    color: ${darken(0.15, colors.clBlueDark)};
    text-decoration: underline;
  }
`;

const Step2Button = styled(Button)``;

// Typings
import { IGroupData } from 'services/groups';

export interface Props {
  onOpenStep2: (groupType: IGroupData['attributes']['membership_type']) => void;
}
export interface State {}

export class GroupCreationStep1 extends React.PureComponent<
  Props & InjectedIntlProps,
  State
> {
  constructor(props) {
    super(props);
    this.state = {};
  }

  createStep2Handler = (
    groupType: IGroupData['attributes']['membership_type']
  ) => () => {
    this.props.onOpenStep2(groupType);
  };

  render() {
    const formattedLink = this.props.intl.formatMessage(messages.readMoreLink);
    return (
      <Container>
        <GroupType className="manual">
          <GroupIcon name="database" />
          <GroupName>
            <FormattedMessage {...messages.step1TypeNameNormal} />
          </GroupName>
          <GroupDescription>
            <DescriptionText>
              <FormattedMessage {...messages.step1TypeDescriptionNormal} />
            </DescriptionText>
            <MoreInfoLink href={formattedLink} target="_blank">
              <FormattedMessage {...messages.step1ReadMore} />
            </MoreInfoLink>
          </GroupDescription>
          <Step2Button
            className="e2e-create-normal-group-button"
            buttonStyle="cl-blue"
            onClick={this.createStep2Handler('manual')}
          >
            <FormattedMessage {...messages.step1CreateButtonNormal} />
          </Step2Button>
        </GroupType>
        <GroupType className="rules">
          <GroupIcon name="lightingBolt" />
          <GroupName>
            <FormattedMessage {...messages.step1TypeNameSmart} />
          </GroupName>
          <GroupDescription>
            <DescriptionText>
              <FormattedMessage {...messages.step1TypeDescriptionSmart} />
            </DescriptionText>
            <MoreInfoLink href={formattedLink} target="_blank">
              <FormattedMessage {...messages.step1ReadMore} />
            </MoreInfoLink>
          </GroupDescription>
          <Step2Button
            className="e2e-create-rules-group-button"
            buttonStyle="cl-blue"
            onClick={this.createStep2Handler('rules')}
          >
            <FormattedMessage {...messages.step1CreateButtonSmart} />
          </Step2Button>
        </GroupType>
      </Container>
    );
  }
}

export default injectIntl<Props>(GroupCreationStep1);
