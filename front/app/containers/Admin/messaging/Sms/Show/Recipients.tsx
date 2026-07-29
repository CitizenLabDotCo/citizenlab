import React from 'react';

import {
  Box,
  Icon,
  IconTooltip,
  colors,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { IGroupData } from 'api/groups/types';

import useLocalize from 'hooks/useLocalize';

import ButtonWithLink from 'components/UI/ButtonWithLink';

import { FormattedMessage } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';

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
}

const Recipients = ({
  selectedGroups,
  noGroupsSelected,
  draft,
  onSendPreview,
  isSendingPreview,
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
        <ButtonWithLink
          buttonStyle="secondary-outlined"
          icon="send"
          onClick={onSendPreview}
          processing={isSendingPreview}
          disabled={isSendingPreview}
        >
          <Box display="inline-flex" alignItems="center">
            <FormattedMessage {...messages.sendSmsPreviewButton} />
            <IconTooltip
              ml="4px"
              content={<FormattedMessage {...messages.sendSmsPreviewTooltip} />}
            />
          </Box>
        </ButtonWithLink>
      )}
    </Box>
  );
};

export default Recipients;
