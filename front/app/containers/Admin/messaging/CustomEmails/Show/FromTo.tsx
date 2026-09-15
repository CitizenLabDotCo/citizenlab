import React, { useMemo } from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import { IEmailCampaign } from 'api/campaigns/email/types';
import useProjectById from 'api/projects/useProjectById';
import useUserById from 'api/users/useUserById';

import useLocalize from 'hooks/useLocalize';

import { useIntl, FormattedMessage } from 'utils/cl-intl';
import { groupIncludedResources } from 'utils/cl-react-query/groupIncludedResources';
import clHistory from 'utils/cl-router/history';
import Link from 'utils/cl-router/Link';
import { getFullName } from 'utils/textUtils';

import messages from '../../messages';

const FromToHeader = styled.span`
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
  campaign: NoInfer<IEmailCampaign>;
}

const FromTo = ({ campaign }: Props) => {
  const { data: project } = useProjectById(
    campaign.data.relationships.context?.data?.id
  );
  const authorId = campaign.data.relationships.author.data.id;
  const { data: sender } = useUserById(authorId);
  const localize = useLocalize();
  const { formatMessage } = useIntl();
  const { data: tenant } = useAppConfiguration();

  const groups = useMemo(() => {
    const groups = groupIncludedResources(campaign.included ?? []).group;
    return groups || [];
  }, [campaign.included]);

  const handleGroupLinkClick =
    (groupId?: string) => (event: React.FormEvent<any>) => {
      event.preventDefault();
      if (groupId) {
        clHistory.push(`/admin/users/groups/${groupId}`);
      } else {
        clHistory.push('/admin/users');
      }
    };

  const getSenderName = (senderType: string) => {
    let senderName: string | null = null;

    if (senderType === 'author' && sender) {
      senderName = getFullName(sender.data);
    } else if (senderType === 'organization' && tenant) {
      senderName = localize(
        tenant.data.attributes.settings.core.organization_name
      );
    }

    return senderName;
  };

  const noGroupsSelected = groups.length === 0;
  const senderType = campaign.data.attributes.sender;
  const senderName = getSenderName(senderType);

  return (
    <Box display="flex" flexDirection="column" mr="auto">
      <div>
        <FromToHeader>
          <FormattedMessage {...messages.campaignFrom} />
          &nbsp;
        </FromToHeader>
        <span>{senderName}</span>
      </div>
      <div>
        <FromToHeader>
          <FormattedMessage {...messages.campaignTo} />
          &nbsp;
        </FromToHeader>
        {campaign.data.attributes.campaign_name ===
          'manual_project_participants' &&
          project && (
            <span>
              <FormattedMessage {...messages.allParticipantsInProject} />{' '}
              <Link
                to="/admin/projects/$projectId"
                params={{ projectId: project.data.id }}
                target="_blank"
              >
                {localize(project.data.attributes.title_multiloc)}
              </Link>
            </span>
          )}
        {noGroupsSelected &&
          campaign.data.attributes.campaign_name === 'manual' && (
            <GroupLink onClick={handleGroupLinkClick()}>
              {formatMessage(messages.allUsers)}
            </GroupLink>
          )}
        {groups.map((group, index) => {
          return (
            <GroupLink key={group.id} onClick={handleGroupLinkClick(group.id)}>
              {localize(group.attributes.title_multiloc)}
              {index < groups.length - 1 && ', '}
            </GroupLink>
          );
        })}
      </div>
    </Box>
  );
};

export default FromTo;
