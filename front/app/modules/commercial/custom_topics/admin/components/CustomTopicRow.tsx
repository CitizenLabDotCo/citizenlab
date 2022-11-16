import React, { memo } from 'react';
import { ITopicData } from 'services/topics';
import { isNilOrError } from 'utils/helperUtils';
import styled from 'styled-components';

// components
import { Row } from 'components/admin/ResourceList';
import Button from 'components/UI/Button';
import { RowContent, RowContentInner, RowTitle } from './RowStyles';
import { Box, Icon, Text } from '@citizenlab/cl2-component-library';
import { colors } from '@citizenlab/cl2-component-library';
import Link from 'utils/cl-router/Link';

// resources
import useCustomPage from 'hooks/useCustomPage';

// hooks
import useLocalize from 'hooks/useLocalize';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

const Buttons = styled.div`
  display: flex;
  align-items: center;
`;

export const StyledLink = styled(Link)`
  text-decoration: underline;

  &:hover {
    text-decoration: underline;
  }
`;

interface Props {
  topic: ITopicData | Error;
  isLastItem: boolean;
  handleDeleteClick: (topicId: string) => (event: React.FormEvent<any>) => void;
}

const CustomTopicRow = memo((props: Props) => {
  const { isLastItem, topic, handleDeleteClick } = props;
  const localize = useLocalize();

  if (!isNilOrError(topic)) {
    const { static_page_ids } = topic.attributes;

    const staticPages = static_page_ids.map((customPageId) => {
      const result = useCustomPage({ customPageId });
      if (!isNilOrError(result)) {
        return result;
      }
      return null;
    });

    return (
      <>
        <Row
          key={topic.id}
          id={topic.id}
          className="e2e-topic-field-row"
          isLastItem={isLastItem}
        >
          <RowContent>
            <RowContentInner>
              <RowTitle value={topic.attributes.title_multiloc} />
            </RowContentInner>
          </RowContent>
          <Buttons>
            <Button
              linkTo={`/admin/settings/topics/${topic.id}/edit`}
              buttonStyle="secondary"
              icon="edit"
              id="e2e-custom-topic-edit-button"
            >
              <FormattedMessage {...messages.editButtonLabel} />
            </Button>

            <Button
              disabled={static_page_ids && static_page_ids.length > 0}
              onClick={handleDeleteClick(topic.id)}
              buttonStyle="text"
              icon="delete"
              id="e2e-custom-topic-delete-button"
            >
              <FormattedMessage {...messages.deleteButtonLabel} />
            </Button>
          </Buttons>
        </Row>
        {static_page_ids.length > 0 && (
          <Box
            bgColor={colors.tealLight}
            borderRadius="3px"
            px="12px"
            py="4px"
            mb="12px"
            role="alert"
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box display="flex" alignItems="center">
              <Box width="5%">
                <Icon
                  name="info-outline"
                  width="24px"
                  height="24px"
                  fill={colors.teal700}
                />
              </Box>
              <Box width="95%">
                <Text color="teal700">
                  <FormattedMessage {...messages.tagIsLinkedToStaticPage} />
                </Text>
                <ul>
                  {staticPages.map((staticPage) => {
                    if (staticPage == null) {
                      return null;
                    }

                    return (
                      <li>
                        <StyledLink
                          to={`/admin/pages-menu/pages/${staticPage.id}/settings`}
                        >
                          <Text color="teal700">
                            {localize(staticPage?.attributes.title_multiloc)}
                          </Text>
                        </StyledLink>
                      </li>
                    );
                  })}
                </ul>
              </Box>
            </Box>
          </Box>
        )}
      </>
    );
  }

  return null;
});

export default CustomTopicRow;
