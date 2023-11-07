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
  const { pathname } = useLocation();

  const isAdminPage = isPage('admin', pathname);

  const buttonText = isAdminPage
    ? messages.postPublicComment
    : messages.publishComment;

  const visible = focused || processing;

  return (
    <Box
      justifyContent="flex-end"
      mt="10px"
      mb="10px"
      mr="10px"
      display={visible ? 'flex' : 'none'}
    >
      {allowAnonymousParticipation && (
        <Checkbox
          id="e2e-anonymous-comment-checkbox"
          ml="8px"
          checked={postAnonymously}
          label={
            <Text mb="12px" fontSize="s" color="coolGrey600">
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
          onChange={() => togglePostAnonymously(!postAnonymously)}
        />
      )}
      <Box mr="8px">
        <Button
          disabled={processing}
          onClick={close}
          buttonStyle="secondary"
          padding={smallerThanTablet ? '6px 12px' : undefined}
        >
          <FormattedMessage {...messages.cancel} />
        </Button>
      </Box>
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
};

export default Actions;
