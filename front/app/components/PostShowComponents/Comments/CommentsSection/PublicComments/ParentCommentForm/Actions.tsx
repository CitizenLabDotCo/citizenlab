import React from 'react';

// routing
import { useLocation } from 'react-router-dom';

// components
import Button from 'components/UI/Button';
import {
  Checkbox,
  useBreakpoint,
  Text,
  IconTooltip,
  Box,
} from '@citizenlab/cl2-component-library';

// i18n
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import messages from '../../../messages';

// utils
import { isPage } from 'utils/helperUtils';

interface Props {
  processing: boolean;
  focused: boolean;
  postAnonymously: boolean;
  allowAnonymousParticipation?: boolean;
  hasEmptyError: boolean;
  togglePostAnonymously: (postAnonymously: boolean) => void;
  onSubmit: () => void;
}

const Actions = ({
  processing,
  focused,
  postAnonymously,
  allowAnonymousParticipation,
  hasEmptyError,
  togglePostAnonymously,
  onSubmit,
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

  const checkbox = (
    <Box display="flex" alignItems="center">
      <Checkbox
        id="e2e-anonymous-comment-checkbox"
        ml="8px"
        mr="4px"
        checked={postAnonymously}
        onChange={() => togglePostAnonymously(!postAnonymously)}
      />
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
    </Box>
  );

  const cancelAndSubmit = (
    <Box display="flex">
      <Button
        disabled={processing}
        onClick={close}
        buttonStyle="secondary"
        padding={smallerThanTablet ? '6px 12px' : undefined}
        mr="8px"
      >
        <FormattedMessage {...messages.cancel} />
      </Button>
      <Button
        className="e2e-submit-parentcomment"
        processing={processing}
        onClick={onSubmit}
        disabled={hasEmptyError}
        padding={smallerThanTablet ? '6px 12px' : undefined}
        icon={isAdminPage ? 'users' : undefined}
      >
        <FormattedMessage {...buttonText} />
      </Button>
    </Box>
  );

  if (smallerThanPhone) {
    return (
      <Box
        justifyContent="flex-end"
        mt="10px"
        mb="10px"
        mr="10px"
        display={visible ? 'flex' : 'none'}
      >
        <Box display="flex" flexDirection="column">
          {allowAnonymousParticipation && (
            <Box
              display="flex"
              flexDirection="row"
              justifyContent="flex-end"
              w="100%"
              mb="12px"
            >
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
      display={visible ? 'flex' : 'none'}
    >
      {cancelAndSubmit}
      {allowAnonymousParticipation && checkbox}
    </Box>
  );
};

export default Actions;
