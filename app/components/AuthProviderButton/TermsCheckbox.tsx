import React, { PureComponent } from 'react';
import Link from 'utils/cl-router/Link';

// components
import Checkbox from 'components/UI/Checkbox';

// i18n
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';

const Container = styled.div``;

const TermsAndConditionsWrapper = styled.div`
  padding: 15px 20px;
  border-radius: ${(props: any) => props.theme.borderRadius};

  span {
    color: ${colors.text} !important;
    font-size: ${fontSizes.base}px;
    font-weight: 400;
    line-height: 21px;
  }

  a > span {
    color: ${colors.text} !important;
    text-decoration: underline;
  }

  a:hover > span {
    color: #000 !important;
    text-decoration: underline;
  }
`;

interface Props {
  providerName: string;
  accepted: boolean;
  onCheck: () => void;
  mode: 'signUp' | 'signIn';
  className?: string;
}

interface State {
  tacAccepted: boolean;
  privacyAccepted: boolean;
  emailAccepted: boolean;
}

class TermsCheckbox extends PureComponent<Props & InjectedIntlProps, State> {
  constructor(props) {
    super(props);
    this.state = {
      tacAccepted: false,
      privacyAccepted: false,
      emailAccepted: false
    };
  }

  handleTaCAcceptedOnChange = (event) => {
    event.stopPropagation();

    const { onCheck } = this.props;

    this.setState(({ tacAccepted, privacyAccepted, emailAccepted }) => {
      if (!tacAccepted && emailAccepted && privacyAccepted) {
        onCheck();
      }
      return ({ tacAccepted: !tacAccepted });
    });
  }

  handlePrivacyAcceptedOnChange = (event) => {
    event.stopPropagation();

    const { onCheck } = this.props;

    this.setState(({ tacAccepted, privacyAccepted, emailAccepted }) => {
      if (tacAccepted && emailAccepted && !privacyAccepted) {
        onCheck();
      }
      return ({ privacyAccepted: !privacyAccepted });
    });
  }

  handleEmailAcceptedOnChange = (event) => {
    event.stopPropagation();

    const { onCheck } = this.props;

    this.setState(({ tacAccepted, privacyAccepted, emailAccepted }) => {
      if (tacAccepted && !emailAccepted && privacyAccepted) {
        onCheck();
      }
      return ({ emailAccepted: !emailAccepted });
    });
  }

  handleLinkClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.stopPropagation();
  }

  render() {
    const {
      accepted,
      providerName,
      onCheck,
      mode,
      className
    } = this.props;

    if (mode === 'signIn') {
      return (
        <Container className={className}>
          <TermsAndConditionsWrapper>
            <Checkbox
              checked={accepted}
              onChange={onCheck}
              label={
                <FormattedMessage
                  {...messages.alreadyAcceptTermsAndConditions}
                  values={{
                    loginMechanismName: providerName,
                    tacLink: <Link
                      target="_blank"
                      to="/pages/terms-and-conditions"
                      onClick={this.handleLinkClick}
                    >
                      <FormattedMessage {...messages.termsAndConditions} />
                    </Link>,
                    ppLink: <Link
                      target="_blank"
                      to="/pages/privacy-policy"
                      onClick={this.handleLinkClick}
                    >
                      <FormattedMessage {...messages.privacyPolicy} />
                    </Link>,
                  }}
                />}
            />
          </TermsAndConditionsWrapper>
        </Container>
      );
    } else {
      return (
        <Container className={className}>
          <TermsAndConditionsWrapper>
            <FormattedMessage
              {...messages.privacyChecks}
              values={{ loginMechanismName: providerName }}
            />
          </TermsAndConditionsWrapper>
          <TermsAndConditionsWrapper>
            <Checkbox
              className="e2e-terms-and-conditions"
              checked={this.state.tacAccepted}
              onChange={this.handleTaCAcceptedOnChange}
              label={
                <FormattedMessage
                  {...messages.tacApproval}
                  values={{
                    tacLink: <Link
                      target="_blank"
                      to="/pages/terms-and-conditions"
                      onClick={this.handleLinkClick}
                    >
                      <FormattedMessage {...messages.termsAndConditions} />
                    </Link>,
                  }}
                />
              }
            />
          </TermsAndConditionsWrapper>
          <TermsAndConditionsWrapper>
            <Checkbox
              className="e2e-privacy-checkbox"
              checked={this.state.privacyAccepted}
              onChange={this.handlePrivacyAcceptedOnChange}
              label={
                <FormattedMessage
                  {...messages.privacyApproval}
                  values={{
                    ppLink: <Link
                      target="_blank"
                      to="/pages/privacy-policy"
                      onClick={this.handleLinkClick}
                    >
                      <FormattedMessage {...messages.privacyPolicy} />
                    </Link>,
                  }}
                />
              }
            />
          </TermsAndConditionsWrapper>
          <TermsAndConditionsWrapper>
            <Checkbox
              className="e2e-email-checkbox"
              checked={this.state.emailAccepted}
              onChange={this.handleEmailAcceptedOnChange}
              label={
                <FormattedMessage
                  {...messages.emailApproval}
                />
              }
            />
          </TermsAndConditionsWrapper>
        </Container>
      );
    }
  }
}

export default injectIntl<Props>(TermsCheckbox);
