import React from 'react';

import { Tooltip, Box } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import useCustomPages from 'api/custom_pages/useCustomPages';
import { IGlobalTopicData } from 'api/global_topics/types';

import useLocalize from 'hooks/useLocalize';

import { Row } from 'components/admin/ResourceList';
import ButtonWithLink from 'components/UI/ButtonWithLink';

import { FormattedMessage } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';
import { isNilOrError } from 'utils/helperUtils';

import messages from './messages';
import { RowDescription, RowTitle } from './RowStyles';

const StyledLink = styled(Link)`
  text-decoration: underline;

  &:hover {
    text-decoration: underline;
  }
`;

interface Props {
  topic: IGlobalTopicData | Error;
  isLastItem: boolean;
  handleDeleteClick?: (
    topicId: string
  ) => (event: React.FormEvent<any>) => void;
}

interface DeleteButtonProps {
  topic: IGlobalTopicData;
  handleDeleteClick?: (
    topicId: string
  ) => (event: React.FormEvent<any>) => void;
}

const DeleteButton = ({ topic, handleDeleteClick }: DeleteButtonProps) => {
  const localize = useLocalize();

  const staticPageIds = topic.relationships.static_pages.data.map(
    (page) => page.id
  );

  const { data: pages } = useCustomPages();

  const staticPages =
    pages?.data.filter((page) => staticPageIds.includes(page.id)) || [];

  const hasStaticPages = staticPageIds.length > 0 && !isNilOrError(staticPages);
  const isDisabled = hasStaticPages;

  const tooltipContent = hasStaticPages ? (
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
  ) : null;

  return (
    <Tooltip content={tooltipContent} disabled={!tooltipContent}>
      <ButtonWithLink
        disabled={isDisabled}
        onClick={isDisabled ? undefined : handleDeleteClick?.(topic.id)}
        buttonStyle="text"
        icon="delete"
        id="e2e-custom-topic-delete-button"
      >
        <FormattedMessage {...messages.deleteButtonLabel} />
      </ButtonWithLink>
    </Tooltip>
  );
};

const TopicRow = (props: Props) => {
  const { isLastItem, topic } = props;
  const localize = useLocalize();

  if (isNilOrError(topic)) {
    return null;
  }

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
          <Box display="flex" alignItems="center" gap="8px">
            <RowTitle>{localize(topic.attributes.title_multiloc)}</RowTitle>
          </Box>
          <RowDescription
            supportHtml
            value={topic.attributes.description_multiloc}
          />
        </Box>
      </Box>
      <Box display="flex" alignItems="center" gap="16px">
        <ButtonWithLink
          linkTo={`/admin/settings/topics/platform/${topic.id}/edit`}
          buttonStyle="secondary-outlined"
          icon="edit"
          m="0px"
          id={`e2e-custom-topic-edit-button`}
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
