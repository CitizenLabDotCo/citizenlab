import React from 'react';

import {
  Box,
  Icon,
  IconTooltip,
  Tooltip,
  colors,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { IGroupData } from 'api/groups/types';

import useLocalize from 'hooks/useLocalize';

import ButtonWithLink from 'components/UI/ButtonWithLink';

import { FormattedMessage } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';
import Link from 'utils/cl-router/Link';

import messages from '../../messages';

const Label = styled.span`
  font-weight: bold;
`;

const GroupLink = styled.a`
  color: inherit;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;

interface Props {
  selectedGroups: IGroupData[];
  noGroupsSelected: boolean;
  draft: boolean;
  onSendPreview: () => void;
  isSendingPreview: boolean;
  insufficientBalance: boolean;
  missingPhoneNumber: boolean;
}

const Recipients = ({
  selectedGroups,
  noGroupsSelected,
  draft,
  onSendPreview,
  isSendingPreview,
  insufficientBalance,
  missingPhoneNumber,
}: Props) => {
  const localize = useLocalize();

  const goToAllUsers = () => clHistory.push('/admin/users');
  const goToGroup = (groupId: string) =>
    clHistory.push(`/admin/users/groups/${groupId}`);

  return (
    <Box
      display="flex"
      alignItems="center"
      p="20px 0"
      borderTop={`1px solid ${colors.borderLight}`}
      borderBottom={`1px solid ${colors.borderLight}`}
      mb="20px"
    >
      <Icon
        name="chat-bubble"
        width="40px"
        height="40px"
        fill={colors.grey400}
        mr="20px"
      />
      <Box mr="auto">
        <Label>
          <FormattedMessage {...messages.fieldTo} />
          :&nbsp;
        </Label>
        {noGroupsSelected ? (
          <GroupLink onClick={goToAllUsers}>
            <FormattedMessage {...messages.allUsers} />
          </GroupLink>
        ) : (
          selectedGroups.map((group, index) => (
            <React.Fragment key={group.id}>
              <GroupLink onClick={() => goToGroup(group.id)}>
                {localize(group.attributes.title_multiloc)}
              </GroupLink>
              {index < selectedGroups.length - 1 && ', '}
            </React.Fragment>
          ))
        )}
      </Box>
      {draft && (
        <Tooltip
          disabled={!missingPhoneNumber}
          placement="top"
          content={
            <FormattedMessage
              {...messages.sendSmsPreviewNoPhoneTooltip}
              values={{
                profileLink: (
                  <Link to="/profile/change-phone">
                    <FormattedMessage
                      {...messages.sendSmsPreviewNoPhoneTooltipLink}
                    />
                  </Link>
                ),
              }}
            />
          }
        >
          <ButtonWithLink
            buttonStyle="secondary-outlined"
            data-testid="e2e-send-sms-preview-button"
            icon="send"
            onClick={onSendPreview}
            processing={isSendingPreview}
            disabled={
              isSendingPreview || insufficientBalance || missingPhoneNumber
            }
          >
            <Box display="inline-flex" alignItems="center">
              <FormattedMessage {...messages.sendSmsPreviewButton} />
              <IconTooltip
                ml="4px"
                content={
                  <FormattedMessage {...messages.sendSmsPreviewTooltip} />
                }
              />
            </Box>
          </ButtonWithLink>
        </Tooltip>
      )}
    </Box>
  );
};

export default Recipients;
