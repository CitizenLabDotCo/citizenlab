import React, { useState, MouseEvent } from 'react';

// components
import { Box, Text } from '@citizenlab/cl2-component-library';
import { Tab } from 'components/admin/NavigationTabs';
import PublicComments from './PublicComments';
import InternalComments from 'components/admin/InternalComments';

// i18n
import { useIntl } from 'utils/cl-intl';
import messages from './messages';

// style
import styled, { css } from 'styled-components';
import { colors } from 'utils/styleUtils';
import { tabBorderSize } from 'components/admin/NavigationTabs/tabsStyleConstants';

// Types
import { ITab } from 'typings';

const NavigationTabs = styled.nav`
  ${({ theme }) => css`
    width: 100%;
    border-radius: ${theme.borderRadius} ${theme.borderRadius} 0 0;
    display: flex;
    border-bottom: ${tabBorderSize}px solid ${colors.grey400};
  `}
`;

export interface Props {
  postId: string;
  postType: 'idea' | 'initiative';
  className?: string;
  allowAnonymousParticipation?: boolean;
}

type CommentType = 'internal' | 'public';
type NavTab = ITab & { name: CommentType };

const CommentsSection = ({
  postId,
  postType,
  className,
  allowAnonymousParticipation,
}: Props) => {
  const { formatMessage } = useIntl();
  const [selectedTab, setSelectedTab] = useState<CommentType>('internal');
  const tabs: NavTab[] = [
    {
      label: formatMessage(messages.internalConversation),
      name: 'internal',
      url: '',
    },
    {
      label: formatMessage(messages.publicDiscussion),
      name: 'public',
      url: '',
    },
  ];

  return (
    <Box mt="70px">
      <NavigationTabs>
        {tabs.map(({ url, label, name }) => (
          <Tab
            label={label}
            url={url}
            key={name}
            active={selectedTab === name}
            handleClick={(event: MouseEvent<HTMLAnchorElement>) => {
              event.preventDefault();
              setSelectedTab(name);
            }}
          >
            <Text>{label}</Text>
          </Tab>
        ))}
      </NavigationTabs>
      <Box>
        {selectedTab === 'public' && (
          <PublicComments
            postId={postId}
            postType={postType}
            allowAnonymousParticipation={allowAnonymousParticipation}
            className={className}
          />
        )}
        {selectedTab === 'internal' && (
          <InternalComments
            postId={postId}
            postType={postType}
            className={className}
          />
        )}
      </Box>
    </Box>
  );
};

export default CommentsSection;
