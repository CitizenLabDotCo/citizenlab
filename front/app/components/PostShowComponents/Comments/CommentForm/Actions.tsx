import React from 'react';

import {
  useBreakpoint,
  Text,
  IconTooltip,
  Box,
  CheckboxWithLabel,
} from '@citizenlab/cl2-component-library';
import { useLocation } from 'react-router-dom';

import ButtonWithLink from 'components/UI/ButtonWithLink';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { isPage } from 'utils/helperUtils';

import messages from '../messages';

interface Props {
  processing: boolean;
  focused: boolean;
  postAnonymously: boolean;
  allowAnonymousParticipation?: boolean;
  submitButtonDisabled: boolean;
  submitButtonClassName: string;
  togglePostAnonymously: (postAnonymously: boolean) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

const Actions = ({
  processing,
  focused,
  postAnonymously,
  allowAnonymousParticipation,
  submitButtonDisabled,
  submitButtonClassName,
  togglePostAnonymously,
  onSubmit,
  onCancel,
}: Props) => {
  const { formatMessage } = useIntl();
  const smallerThanTablet = useBreakpoint('tablet');
  const smallerThanPhone = useBreakpoint('phone');
  const { pathname } = useLocation();

  const isAdminPage = isPage('admin', pathname);

  const buttonText = isAdminPage
    ? messages.postPublicComment
    : messages.publishComment;

  const visible = focused || processing;

  if (!visible) {
    return null;
  }

  const checkbox = (
    <CheckboxWithLabel
      dataTestId="e2e-post-comment-anonymously-checkbox"
      ml="8px"
      mr="4px"
      checked={postAnonymously}
      onChange={() => togglePostAnonymously(!postAnonymously)}
      label={
        <Text m="0px" fontSize="s" color="coolGrey600">
          {formatMessage(messages.postAnonymously)}
          <IconTooltip
            content={
              <Text color="white" fontSize="s" m="0">
                {formatMessage(messages.inputsAssociatedWithProfile)}
              </Text>
            }
            iconSize="16px"
            placement="top-start"
            display="inline"
            ml="4px"
            transform="translate(0,-1)"
          />
        </Text>
      }
    />
  );

  const cancelAndSubmit = (
    <Box display="flex">
      <ButtonWithLink
        disabled={processing}
        buttonStyle="secondary-outlined"
        padding={smallerThanTablet ? '6px 12px' : undefined}
        mr="8px"
        onClick={onCancel}
      >
        <FormattedMessage {...messages.cancel} />
      </ButtonWithLink>
      <ButtonWithLink
        className={submitButtonClassName}
        id="e2e-submit-comment-btn"
        processing={processing}
        disabled={submitButtonDisabled}
        padding={smallerThanTablet ? '6px 12px' : undefined}
        icon={isAdminPage ? 'users' : undefined}
        onClick={onSubmit}
      >
        <FormattedMessage {...buttonText} />
      </ButtonWithLink>
    </Box>
  );

  if (smallerThanPhone) {
    return (
      <Box
        justifyContent="flex-end"
        mt="10px"
        mb="10px"
        mr="10px"
        display="flex"
      >
        <Box display="flex" flexDirection="column">
          {allowAnonymousParticipation && (
            <Box display="flex" justifyContent="flex-end" w="100%" mb="12px">
              {checkbox}
            </Box>
          )}
          {cancelAndSubmit}
        </Box>
      </Box>
    );
  }

  return (
    <Box
      flexDirection="row-reverse"
      justifyContent="space-between"
      mt="10px"
      mb="10px"
      mr="10px"
      display="flex"
    >
      {cancelAndSubmit}
      {allowAnonymousParticipation && checkbox}
    </Box>
  );
};

export default Actions;
