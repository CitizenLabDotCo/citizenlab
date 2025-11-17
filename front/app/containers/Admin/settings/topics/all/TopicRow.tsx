import React from 'react';

import { Tooltip, colors, Text, Box } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import useCustomPages from 'api/custom_pages/useCustomPages';
import { ITopicData } from 'api/topics/types';

import useLocalize from 'hooks/useLocalize';

import { Row } from 'components/admin/ResourceList';
import ButtonWithLink from 'components/UI/ButtonWithLink';

import { FormattedMessage } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';
import { isNilOrError } from 'utils/helperUtils';

import messages from './messages';
import { RowDescription, RowTitle } from './RowStyles';

const StyledLink = styled(Link)`
  color: ${colors.white} !important;
  text-decoration: underline;

  &:hover {
    text-decoration: underline;
  }
`;

interface Props {
  topic: ITopicData | Error;
  isLastItem: boolean;
  handleDeleteClick?: (
    topicId: string
  ) => (event: React.FormEvent<any>) => void;
}

interface DeleteButtonProps {
  topic: ITopicData;
  handleDeleteClick?: (
    topicId: string
  ) => (event: React.FormEvent<any>) => void;
}

const DeleteButton = ({ topic, handleDeleteClick }: DeleteButtonProps) => {
  const localize = useLocalize();
  const isCustomTopic = topic.attributes.code === 'custom';

  const staticPageIds = topic.relationships.static_pages.data.map(
    (page) => page.id
  );

  const { data: pages } = useCustomPages();

  const staticPages =
    pages?.data.filter((page) => staticPageIds.includes(page.id)) || [];

  const hasStaticPages = staticPageIds.length > 0 && !isNilOrError(staticPages);

  // Determine button configuration
  const isDisabled = !isCustomTopic || hasStaticPages;
  const buttonId = isCustomTopic
    ? 'e2e-custom-topic-delete-button'
    : 'e2e-default-topic-delete-button';

  // Determine tooltip configuration
  let tooltipContent: React.ReactNode = null;
  if (!isCustomTopic) {
    tooltipContent = (
      <FormattedMessage {...messages.defaultTagCannotBeDeleted} />
    );
  } else if (hasStaticPages) {
    tooltipContent = (
      <>
        <FormattedMessage {...messages.tagIsLinkedToStaticPage} />
        <ul>
          {staticPages.map((staticPage) => (
            <li key={staticPage.id}>
              <StyledLink
                to={`/admin/pages-menu/pages/${staticPage.id}/settings`}
              >
                {localize(staticPage.attributes.title_multiloc)}
              </StyledLink>
            </li>
          ))}
        </ul>
      </>
    );
  }

  return (
    <Tooltip content={tooltipContent} disabled={!tooltipContent}>
      <ButtonWithLink
        disabled={isDisabled}
        onClick={isDisabled ? undefined : handleDeleteClick?.(topic.id)}
        buttonStyle="text"
        icon="delete"
        id={buttonId}
      >
        <FormattedMessage {...messages.deleteButtonLabel} />
      </ButtonWithLink>
    </Tooltip>
  );
};

const TopicRow = (props: Props) => {
  const { isLastItem, topic } = props;

  if (isNilOrError(topic)) {
    return null;
  }

  const isCustomTopic = topic.attributes.code === 'custom';

  return (
    <Row
      id={topic.id}
      key={topic.id}
      className="e2e-topic-field-row"
      isLastItem={isLastItem}
    >
      <Box
        flex="1"
        display="flex"
        alignItems="center"
        justifyContent="space-between"
      >
        <Box
          display="flex"
          flexDirection="column"
          alignItems="flex-start"
          flexWrap="wrap"
          mr="20px"
          minHeight="40px"
        >
          <RowTitle value={topic.attributes.title_multiloc}></RowTitle>
          {topic.attributes.description_multiloc && (
            <RowDescription value={topic.attributes.description_multiloc} />
          )}
        </Box>
      </Box>
      <Box display="flex" alignItems="center" gap="16px">
        {!isCustomTopic && (
          <Text m="0px">
            <FormattedMessage {...messages.defaultTopic} />
          </Text>
        )}
        <ButtonWithLink
          linkTo={`/admin/settings/topics/${topic.id}/edit`}
          buttonStyle="secondary-outlined"
          icon="edit"
          m="0px"
          id={`e2e-${isCustomTopic ? 'custom' : 'default'}-topic-edit-button`}
        >
          <FormattedMessage {...messages.editButtonLabel} />
        </ButtonWithLink>
        <DeleteButton
          topic={topic}
          handleDeleteClick={props.handleDeleteClick}
        />
      </Box>
    </Row>
  );
};

export default TopicRow;
