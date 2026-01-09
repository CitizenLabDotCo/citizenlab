import React, { useState } from 'react';

import {
  Box,
  Text,
  Button,
  Toggle,
  CollapsibleContainer,
  colors,
  fontSizes,
  Spinner,
  Icon,
  Input,
  IconTooltip,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import useCheckEmailBan from 'api/email_bans/useCheckEmailBan';
import useUserParticipationStats from 'api/user_participation_stats/useUserParticipationStats';
import { IUserData } from 'api/users/types';
import useDeleteUser from 'api/users/useDeleteUser';

import events from 'containers/Admin/users/events';
import adminUserMessages from 'containers/Admin/users/messages';

import Modal from 'components/UI/Modal';
import Warning from 'components/UI/Warning';

import { useIntl } from 'utils/cl-intl';
import { getLocalisedDateString } from 'utils/dateUtils';
import eventEmitter from 'utils/eventEmitter';
import { getFullName } from 'utils/textUtils';

import messages from './messages';

const ProfileLink = styled.a`
  color: inherit;
  font-weight: bold;
  font-size: ${fontSizes.m}px;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const EmailLink = styled.a`
  color: ${colors.teal500};
`;

type Props = {
  setClose: () => void;
  user: IUserData;
  returnFocusRef?: React.RefObject<HTMLElement>;
};

const DeleteUserModal = ({ setClose, user, returnFocusRef }: Props) => {
  const [deleteParticipationData, setDeleteParticipationData] = useState(false);
  const [banEmail, setBanEmail] = useState(false);
  const [banReason, setBanReason] = useState('');
  const { formatMessage } = useIntl();
  const { mutate: deleteUser, isLoading } = useDeleteUser();
  const { data: statsResponse, isLoading: isLoadingStats } =
    useUserParticipationStats({ id: user.id });
  const { data: banDetails } = useCheckEmailBan(user.attributes.email);

  const stats = statsResponse?.data.attributes;
  const isAlreadyBanned = !!banDetails;

  const handleDelete = () => {
    deleteUser(
      {
        userId: user.id,
        deleteParticipationData,
        banEmail,
        banReason: banEmail && banReason ? banReason : undefined,
      },
      {
        onSuccess: () => {
          setClose();
        },
        onError: () => {
          setClose();
          eventEmitter.emit(
            events.userDeletionFailed,
            formatMessage(adminUserMessages.userDeletionFailed)
          );
        },
      }
    );
  };

  const hasParticipation =
    stats && Object.values(stats).some((count) => count > 0);

  const participationItems = [
    { count: stats?.ideas_count, message: messages.ideasCount },
    { count: stats?.proposals_count, message: messages.proposalsCount },
    {
      count: stats?.survey_responses_count,
      message: messages.surveyResponsesCount,
    },
    { count: stats?.comments_count, message: messages.commentsCount },
    { count: stats?.reactions_count, message: messages.reactionsCount },
    { count: stats?.baskets_count, message: messages.votesCount },
    {
      count: stats?.poll_responses_count,
      message: messages.pollResponsesCount,
    },
    { count: stats?.volunteers_count, message: messages.volunteersCount },
    {
      count: stats?.event_attendances_count,
      message: messages.eventAttendancesCount,
    },
  ].filter((item) => item.count && item.count > 0);

  const memberSinceDate = getLocalisedDateString(
    user.attributes.registration_completed_at
  );

  return (
    <Modal
      close={setClose}
      opened={true}
      header={formatMessage(messages.deleteUserHeader)}
      returnFocusRef={returnFocusRef}
    >
      <Box p="30px">
        <Text mt="0" color="textSecondary">
          {formatMessage(messages.deleteUserIntro)}
        </Text>

        <Box
          background={colors.grey100}
          borderRadius="3px"
          p="16px"
          mb="24px"
          mt="12px"
        >
          <ProfileLink
            href={`/profile/${user.attributes.slug}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {getFullName(user)}
            <Icon
              name="open-in-new"
              width="14px"
              height="14px"
              fill={colors.coolGrey600}
            />
          </ProfileLink>

          <Text m="0" mt="4px">
            <EmailLink href={`mailto:${user.attributes.email}`}>
              {user.attributes.email}
            </EmailLink>
          </Text>

          {memberSinceDate && (
            <Text m="0" mt="4px" color="textSecondary">
              {formatMessage(messages.memberSince, { date: memberSinceDate })}
            </Text>
          )}
        </Box>

        {isLoadingStats ? (
          <Box display="flex" justifyContent="center" py="16px">
            <Spinner />
          </Box>
        ) : (
          <CollapsibleContainer
            title={formatMessage(messages.participationSummary)}
            isOpenByDefault={false}
            titleVariant="h5"
            titleAs="h3"
            mb="24px"
          >
            <Box mt="8px">
              {hasParticipation ? (
                <Box as="ul" m="0" px="24px">
                  {participationItems.map((item) => (
                    <Text
                      key={item.message.id}
                      as="li"
                      m="0"
                      color="textSecondary"
                    >
                      {formatMessage(item.message, { count: item.count! })}
                    </Text>
                  ))}
                </Box>
              ) : (
                <Text m="0" color="textSecondary">
                  {formatMessage(messages.noParticipation)}
                </Text>
              )}
            </Box>
          </CollapsibleContainer>
        )}

        <Box mb="24px">
          <Toggle
            checked={deleteParticipationData}
            onChange={() =>
              setDeleteParticipationData(!deleteParticipationData)
            }
            label={formatMessage(messages.deleteParticipationData)}
          />
        </Box>

        {isAlreadyBanned && (
          <Box mb="24px" p="16px" background={colors.red100} borderRadius="3px">
            <Text m="0" color="error">
              {formatMessage(messages.emailAlreadyBanned)}
            </Text>
            {banDetails.data.attributes.reason && (
              <Text m="0" mt="8px" fontSize="s" color="textSecondary">
                <strong>{formatMessage(messages.banReasonLabel)}:</strong>{' '}
                {banDetails.data.attributes.reason}
              </Text>
            )}
          </Box>
        )}

        <Box mb="24px">
          <Toggle
            checked={isAlreadyBanned || banEmail}
            disabled={isAlreadyBanned}
            onChange={() => setBanEmail(!banEmail)}
            label={
              <Box display="flex" alignItems="center" gap="4px">
                {formatMessage(messages.banEmail)}
                <IconTooltip
                  content={formatMessage(messages.banEmailTooltip)}
                />
              </Box>
            }
          />
          {banEmail && (
            <Box mt="12px">
              <Input
                type="text"
                value={banReason}
                onChange={(e) => setBanReason(e)}
                placeholder={formatMessage(messages.banReasonPlaceholder)}
              />
            </Box>
          )}
        </Box>

        <Box m="30px 0">
          <Warning>{formatMessage(messages.cannotBeUndone)}</Warning>
        </Box>

        <Box display="flex" gap="12px">
          <Button buttonStyle="secondary" onClick={setClose}>
            {formatMessage(messages.cancel)}
          </Button>
          <Button
            buttonStyle="delete"
            onClick={handleDelete}
            processing={isLoading}
          >
            {formatMessage(messages.deleteAccount)}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default DeleteUserModal;
