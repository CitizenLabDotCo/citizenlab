import React, { memo, useCallback } from 'react';
import useInitiativesPermissions, {
  IInitiativeDisabledReason,
} from 'hooks/useInitiativesPermissions';
import { trackEventByName } from 'utils/analytics';
import clHistory from 'utils/cl-router/history';
import { openVerificationModal } from 'components/Verification/verificationModalEvents';
import { FormattedMessage } from 'utils/cl-intl';
import Button from 'components/UI/Button';
import messages from './messages';
import { openSignUpInModal } from 'components/SignUpIn/events';
import Tippy from '@tippyjs/react';
import { colors, fontSizes, Icon, ButtonStyles } from 'cl2-component-library';
import { darken } from 'polished';
import styled from 'styled-components';
import { stringify } from 'qs';

const TooltipContent = styled.div<{ inMap?: boolean }>`
  display: flex;
  align-items: center;
  padding: ${(props) => (props.inMap ? '0px' : '15px')};
`;

const TooltipContentIcon = styled(Icon)`
  flex: 0 0 25px;
  width: 20px;
  height: 25px;
  margin-right: 1rem;
`;

const TooltipContentText = styled.div`
  flex: 1 1 auto;
  color: ${colors.text};
  font-size: ${fontSizes.base}px;
  line-height: normal;
  font-weight: 400;
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;

  a,
  button {
    color: ${colors.clBlueDark};
    font-size: ${fontSizes.base}px;
    line-height: normal;
    font-weight: 400;
    text-align: left;
    text-decoration: underline;
    white-space: normal;
    overflow-wrap: break-word;
    word-wrap: break-word;
    word-break: break-all;
    word-break: break-word;
    hyphens: auto;
    display: inline;
    padding: 0px;
    margin: 0px;
    cursor: pointer;
    transition: all 100ms ease-out;

    &:hover {
      color: ${darken(0.15, colors.clBlueDark)};
      text-decoration: underline;
    }
  }
`;

const disabledMessages: {
  [key in IInitiativeDisabledReason]: ReactIntl.FormattedMessage.MessageDescriptor;
} = {
  notPermitted: messages.postingNotPermitted,
};

interface Props {
  lat?: number | null;
  lng?: number | null;
  inMap?: boolean;
  location: 'initiatives_footer' | 'initiatives_header' | 'in_map';
  buttonStyle?: ButtonStyles;
  className?: string;
}

export default memo<Props>(
  ({ lat, lng, inMap, location, buttonStyle, className }) => {
    const { disabledReason, action, enabled } = useInitiativesPermissions(
      'posting_initiative'
    ) || { disabledReason: null, action: null, enabled: null };

    const redirectToInitiativeForm = () => {
      trackEventByName('redirected to initiatives form');
      clHistory.push({
        pathname: `/initiatives/new`,
        search:
          lat && lng
            ? stringify({ lat, lng }, { addQueryPrefix: true })
            : undefined,
      });
    };

    const onNewInitiativeButtonClick = useCallback(
      (event?: React.FormEvent) => {
        event?.preventDefault();

        trackEventByName('New initiative button clicked', {
          extra: {
            disabledReason,
            location,
          },
        });

        if (enabled) {
          switch (action) {
            case 'sign_in_up':
              trackEventByName(
                'Sign up/in modal opened in response to clicking new initiative'
              );
              openSignUpInModal({
                flow: 'signup',
                verification: false,
                verificationContext: undefined,
                action: redirectToInitiativeForm,
              });
              break;
            case 'sign_in_up_and_verify':
              trackEventByName(
                'Sign up/in modal opened in response to clicking new initiative'
              );
              openSignUpInModal({
                flow: 'signup',
                verification: true,
                verificationContext: {
                  type: 'initiative',
                  action: 'posting_initiative',
                },
                action: redirectToInitiativeForm,
              });
              break;
            case 'verify':
              trackEventByName(
                'Verification modal opened in response to clicking new initiative'
              );
              openVerificationModal({
                context: {
                  action: 'posting_initiative',
                  type: 'initiative',
                },
              });
              break;
            default:
              redirectToInitiativeForm();
          }
        }
      },
      [enabled, action, disabledReason, location]
    );

    const tippyContent = disabledReason ? (
      <TooltipContent id="tooltip-content" className="e2e-disabled-tooltip">
        <TooltipContentIcon name="lock-outlined" ariaHidden />
        <TooltipContentText>
          <FormattedMessage {...disabledMessages[disabledReason]} />
        </TooltipContentText>
      </TooltipContent>
    ) : null;

    if (inMap && tippyContent) {
      return tippyContent;
    }

    return (
      <div className={className || ''}>
        <Tippy
          disabled={!tippyContent}
          interactive={true}
          placement="bottom"
          content={tippyContent || <></>}
          theme="light"
          hideOnClick={false}
        >
          <div
            tabIndex={!enabled ? 0 : -1}
            className={`e2e-idea-button ${!enabled ? 'disabled' : ''} ${
              disabledReason ? disabledReason : ''
            }`}
          >
            <Button
              fontWeight="500"
              padding="13px 22px"
              buttonStyle={buttonStyle || 'primary'}
              onClick={onNewInitiativeButtonClick}
              icon="arrowLeft"
              iconPos="right"
              disabled={!!disabledReason}
              text={<FormattedMessage {...messages.startInitiative} />}
            />
          </div>
        </Tippy>
      </div>
    );
  }
);
