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
import { colors } from 'utils/styleUtils';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
`;

const CheckboxWrapper = styled.div``;

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
      <CheckboxWrapper className={`${tacError && 'error'}`}>
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
      </CheckboxWrapper>
      <Error text={tacError ? formatMessage(messages.tacError) : null} />

      <CheckboxWrapper className={`${privacyError && 'error'}`}>
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
      </CheckboxWrapper>
      <Error text={privacyError ? formatMessage(messages.privacyError) : null} />
    </Container>
  );
});

export default injectIntl(Consent);
