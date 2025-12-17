import React, { useState } from 'react';

import {
  Box,
  Text,
  Input,
  Button,
  colors,
  Spinner,
} from '@citizenlab/cl2-component-library';

import useCheckEmailBan from 'api/email_bans/useCheckEmailBan';
import useEmailBansCount from 'api/email_bans/useEmailBansCount';
import useUnbanEmail from 'api/email_bans/useUnbanEmail';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';
import UsersHeader from './UsersHeader';

const BannedEmails = () => {
  const { formatMessage } = useIntl();
  const [emailToCheck, setEmailToCheck] = useState('');
  const [searchedEmail, setSearchedEmail] = useState<string | null>(null);

  const { data: countData, isLoading: isLoadingCount } = useEmailBansCount();
  const {
    data: banDetails,
    isLoading: isCheckingBan,
    error: checkError,
  } = useCheckEmailBan(searchedEmail);
  const { mutate: unban, isLoading: isUnbanning } = useUnbanEmail();

  const handleCheck = () => {
    if (emailToCheck.trim()) {
      setSearchedEmail(emailToCheck.trim());
    }
  };

  const handleUnban = () => {
    if (searchedEmail) {
      unban(searchedEmail, {
        onSuccess: () => {
          setSearchedEmail(null);
          setEmailToCheck('');
        },
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCheck();
    }
  };

  const count = countData?.data.attributes.count ?? 0;
  const isBanned = !!banDetails && !checkError;

  return (
    <>
      <UsersHeader
        title={messages.bannedEmails}
        subtitle={messages.bannedEmailsSubtitle}
      />
      <Box p="20px">
        <Box
          mb="24px"
          p="20px"
          background={colors.grey100}
          borderRadius="3px"
          display="inline-block"
        >
          <Text fontWeight="bold" m="0" mb="4px">
            {formatMessage(messages.totalBannedEmails)}
          </Text>
          {isLoadingCount ? (
            <Spinner size="20px" />
          ) : (
            <Text m="0" fontSize="xl">
              {count}
            </Text>
          )}
        </Box>

        <Box mb="24px">
          <Text fontWeight="bold" mb="8px">
            {formatMessage(messages.checkEmailBan)}
          </Text>
          <Box display="flex" gap="8px" maxWidth="500px">
            <Box flex="1">
              <Input
                type="email"
                value={emailToCheck}
                onChange={setEmailToCheck}
                onKeyDown={handleKeyDown}
                placeholder={formatMessage(messages.enterEmailPlaceholder)}
              />
            </Box>
            <Button onClick={handleCheck} disabled={!emailToCheck.trim()}>
              {formatMessage(messages.checkButton)}
            </Button>
          </Box>
        </Box>

        {searchedEmail && isCheckingBan && <Spinner />}

        {searchedEmail && !isCheckingBan && (
          <Box
            p="16px"
            background={isBanned ? colors.red100 : colors.green100}
            borderRadius="3px"
            maxWidth="500px"
          >
            {isBanned ? (
              <>
                <Text m="0" mb="8px" color="error">
                  {formatMessage(messages.emailIsBanned, {
                    email: searchedEmail,
                  })}
                </Text>
                {banDetails.data.attributes.reason && (
                  <Text m="0" mb="12px" fontSize="s" color="textSecondary">
                    <strong>{formatMessage(messages.banReason)}:</strong>{' '}
                    {banDetails.data.attributes.reason}
                  </Text>
                )}
                <Button
                  buttonStyle="delete"
                  onClick={handleUnban}
                  processing={isUnbanning}
                >
                  {formatMessage(messages.unbanButton)}
                </Button>
              </>
            ) : (
              <Text m="0" color="success">
                {formatMessage(messages.emailNotBanned, {
                  email: searchedEmail,
                })}
              </Text>
            )}
          </Box>
        )}
      </Box>
    </>
  );
};

export default BannedEmails;
