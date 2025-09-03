import React from 'react';

import { IconTooltip, colors } from '@citizenlab/cl2-component-library';
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
import { RowContent, RowContentInner, RowTitle } from './RowStyles';

const Buttons = styled.div`
  display: flex;
  align-items: center;
`;

export const StyledLink = styled(Link)`
  color: ${colors.white} !important;
  text-decoration: underline;

  &:hover {
    text-decoration: underline;
  }
`;

interface Props {
  topic: ITopicData;
  isLastItem: boolean;
  handleDeleteClick: (topicId: string) => (event: React.FormEvent<any>) => void;
}

const CustomTopicRow = (props: Props) => {
  const { isLastItem, topic, handleDeleteClick } = props;
  const localize = useLocalize();

  const staticPageIds = topic.relationships.static_pages.data.map(
    (page) => page.id
  );

  const { data: pages } = useCustomPages();

  const staticPages =
    pages?.data.filter((page) => staticPageIds.includes(page.id)) || [];

  return (
    <Row
      id={topic.id}
      key={topic.id}
      className="e2e-topic-field-row"
      isLastItem={isLastItem}
    >
      <RowContent>
        <RowContentInner>
          <RowTitle value={topic.attributes.title_multiloc} />
        </RowContentInner>
      </RowContent>
      <Buttons>
        {staticPageIds.length > 0 && !isNilOrError(staticPages) && (
          <IconTooltip
            mr="20px"
            iconColor={colors.error}
            icon="info-outline"
            content={
              <>
                <FormattedMessage {...messages.tagIsLinkedToStaticPage} />
                <ul>
                  {staticPages.map((staticPage) => {
                    return (
                      <li key={staticPage.id}>
                        <StyledLink
                          to={`/admin/pages-menu/pages/${staticPage.id}/settings`}
                        >
                          {localize(staticPage.attributes.title_multiloc)}
                        </StyledLink>
                      </li>
                    );
                  })}
                </ul>
              </>
            }
          />
        )}

        <ButtonWithLink
          linkTo={`/admin/settings/topics/${topic.id}/edit`}
          buttonStyle="secondary-outlined"
          icon="edit"
          id="e2e-custom-topic-edit-button"
        >
          <FormattedMessage {...messages.editButtonLabel} />
        </ButtonWithLink>
        <ButtonWithLink
          disabled={staticPageIds.length > 0}
          onClick={handleDeleteClick(topic.id)}
          buttonStyle="text"
          icon="delete"
          id="e2e-custom-topic-delete-button"
        >
          <FormattedMessage {...messages.deleteButtonLabel} />
        </ButtonWithLink>
      </Buttons>
    </Row>
  );
};

export default CustomTopicRow;
