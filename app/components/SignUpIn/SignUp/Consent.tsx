import React, { memo,  useCallback, useState } from 'react';

// components
import Link from 'utils/cl-router/Link';
import Checkbox from 'components/UI/Checkbox';
import Error from 'components/UI/Error';

// i18n
import { InjectedIntlProps } from 'react-intl';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// style
import styled from 'styled-components';
import { fontSizes, colors } from 'utils/styleUtils';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
`;

const CheckboxWrapper = styled.div`
  margin-bottom: 15px;
`;

const EmailConsent = styled.div`
  color: ${colors.label};
  font-size: ${fontSizes.base}px;
  line-height: normal;
`;

interface Props {
  tacError: boolean;
  privacyError: boolean;
  onTacAcceptedChange: (tacAccepted: boolean) => void;
  onPrivacyAcceptedChange: (privacyAccepted: boolean) => void;
  className?: string;
}

const Consent = memo<Props & InjectedIntlProps>(({
  className,
  intl: { formatMessage },
  tacError,
  privacyError,
  onTacAcceptedChange,
  onPrivacyAcceptedChange
}) => {
  const [tacAccepted, setTacAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  const toggleTacAccepted = useCallback(() => {
    onTacAcceptedChange(!tacAccepted);
    setTacAccepted(!tacAccepted);
  }, [tacAccepted, onTacAcceptedChange]);

  const togglePrivacyAccepted = useCallback(() => {
    onPrivacyAcceptedChange(!privacyAccepted);
    setPrivacyAccepted(!privacyAccepted);
  }, [privacyAccepted, onPrivacyAcceptedChange]);

  return (
    <Container className={className}>
      <CheckboxWrapper>
        <Checkbox
          id="terms-and-conditions-checkbox"
          className="e2e-terms-and-conditions"
          checked={tacAccepted}
          onChange={toggleTacAccepted}
          label={
            <FormattedMessage
              {...messages.tacApproval}
              values={{
                tacLink: <Link target="_blank" to="/pages/terms-and-conditions"><FormattedMessage {...messages.termsAndConditions} /></Link>
              }}
            />
          }
        />
        <Error text={tacError ? formatMessage(messages.tacError) : null} />
      </CheckboxWrapper>

      <CheckboxWrapper>
        <Checkbox
          id="privacy-checkbox"
          className="e2e-privacy-checkbox"
          checked={privacyAccepted}
          onChange={togglePrivacyAccepted}
          label={
            <FormattedMessage
              {...messages.privacyApproval}
              values={{
                ppLink: <Link target="_blank" to="/pages/privacy-policy"><FormattedMessage {...messages.privacyPolicy} /></Link>
              }}
            />
          }
        />
        <Error text={privacyError ? formatMessage(messages.privacyError) : null} />
      </CheckboxWrapper>

      <EmailConsent>
        <FormattedMessage {...messages.emailConsent} />
      </EmailConsent>
    </Container>
  );
});

export default injectIntl(Consent);
