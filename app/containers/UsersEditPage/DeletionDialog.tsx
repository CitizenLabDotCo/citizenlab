import React, { PureComponent } from 'react';
import { InjectedIntlProps } from 'react-intl';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import messages from './messages';
import { adopt } from 'react-adopt';
import GetAppConfiguration, {
  GetAppConfigurationChildProps,
} from 'resources/GetTenant';
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';
import styled from 'styled-components';
import { isNilOrError } from 'utils/helperUtils';
import { get } from 'lodash-es';
import { fontSizes } from 'utils/styleUtils';
import Button from 'components/UI/Button';
import Error from 'components/UI/Error';
import FormattedAnchor from 'components/FormattedAnchor';
import Link from 'utils/cl-router/Link';
import { signOutAndDeleteAccountPart1 } from 'services/auth';

const Container = styled.div`
  padding: 0px 10px;
  line-height: 25px;
  font-size: ${fontSizes.base}px;
`;

const Logo = styled.img`
  max-width: 100%;
  max-height: 44px;
  margin: 0;
  padding: 0px;
  cursor: pointer;
`;

const Styledh1 = styled.h1`
  font-size: ${fontSizes.xxl}px;
  font-weight: 500;
  margin-top: 20px;
  margin-bottom: 0;
  line-height: 33px;
`;

const Styledh2 = styled.h2`
  font-size: ${fontSizes.large}px;
  font-weight: 500;
  line-height: 24px;
`;

const ButtonsContainer = styled.div`
  margin-top: 50px;
  margin-bottom: 20px;
  display: flex;
`;

interface InputProps {
  closeDialog: () => void;
}

interface DataProps {
  tenant: GetAppConfigurationChildProps;
  authUser: GetAuthUserChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {
  error: boolean;
  processing: boolean;
}

class DeletionDialog extends PureComponent<Props & InjectedIntlProps, State> {
  constructor(props) {
    super(props);
    this.state = {
      error: false,
      processing: false,
    };
  }

  deleteProfile = () => {
    signOutAndDeleteAccountPart1();
    this.props.closeDialog();
  };

  render() {
    const {
      tenant,
      intl: { formatMessage },
    } = this.props;
    const { processing, error } = this.state;
    const tenantLogo = !isNilOrError(tenant)
      ? get(
          tenant.attributes.logo,
          'medium',
          get(tenant.attributes.logo, 'small')
        )
      : null;

    return (
      <Container>
        {tenantLogo && (
          <Logo src={tenantLogo} alt={formatMessage(messages.logoAltText)} />
        )}
        <Styledh1>
          <FormattedMessage {...messages.deleteYourAccount} />
        </Styledh1>
        <p>
          <FormattedMessage {...messages.deleteAccountSubtext} />
        </p>
        <Styledh2>
          <FormattedMessage {...messages.reasonsToStayListTitle} />
        </Styledh2>
        <ul>
          <li>
            <FormattedMessage {...messages.tooManyEmails} />
          </li>
          <li>
            <FormattedMessage
              {...messages.privacyReasons}
              values={{
                conditionsLink: (
                  <Link to="/pages/cookie-policy" target="_blank">
                    <FormattedMessage {...messages.conditionsLinkText} />
                  </Link>
                ),
              }}
            />
          </li>
          <li>
            <FormattedAnchor
              mainMessage={messages.contactUs}
              mainMessageLinkKey="feedbackLink"
              urlMessage={messages.feedbackLinkUrl}
              urlMessageValues={{ url: location.href }}
              linkTextMessage={messages.feedbackLinkText}
              target="_blank"
            />
          </li>
          <li>
            <FormattedMessage {...messages.noGoingBack} />
          </li>
        </ul>
        <ButtonsContainer>
          <Button
            buttonStyle="delete"
            id="deletion"
            onClick={this.deleteProfile}
            width="auto"
            justifyWrapper="left"
            processing={processing}
            className="e2e-delete-profile-confirm"
          >
            <FormattedMessage {...messages.deleteMyAccount} />
          </Button>
          <Button
            buttonStyle="text"
            onClick={this.props.closeDialog}
            width="auto"
            justifyWrapper="left"
            processing={processing}
          >
            <FormattedMessage {...messages.cancel} />
          </Button>
        </ButtonsContainer>
        {error && (
          <Error text={<FormattedMessage {...messages.deleteProfileError} />} />
        )}
      </Container>
    );
  }
}

const DeletionDialogWithIntl = injectIntl(DeletionDialog);

const Data = adopt<DataProps, InputProps>({
  tenant: <GetAppConfiguration />,
  authUser: <GetAuthUser />,
});

const WrappedDeletionDialog = (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => <DeletionDialogWithIntl {...inputProps} {...dataProps} />}
  </Data>
);

export default WrappedDeletionDialog;
