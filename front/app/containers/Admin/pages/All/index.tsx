import React from 'react';
import styled from 'styled-components';
import { isNilOrError } from 'utils/helperUtils';

// services
import { deletePage, FIXED_PAGES, IPageData } from 'services/pages';

// hooks
import usePages from 'hooks/usePages';

// intl
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import T from 'components/T';
import messages from '../messages';

// components
import { List, Row, TextCell } from 'components/admin/ResourceList';
import Button from 'components/UI/Button';
import FeatureFlag from 'components/FeatureFlag';
import PageWrapper, { ButtonWrapper } from 'components/admin/PageWrapper';

const PageTitle = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 3rem;
`;

// This will be removed at the end of this epic
const NON_CUSTOM_PAGES = new Set([
  'home',
  'projects',
  'all_input',
  'proposals',
  'events',
  ...FIXED_PAGES,
  'homepage-info', // This is the custom footer! TODO: see CL2-6795
]);

const isCustom = (page: IPageData) =>
  !NON_CUSTOM_PAGES.has(page.attributes.slug);

const Pages = ({ intl: { formatMessage } }: InjectedIntlProps) => {
  const pages = usePages();

  if (isNilOrError(pages)) return null;

  const customPages = pages.filter(isCustom);

  const handleOnDeleteClick = (pageId: string) => (event) => {
    const deleteMessage = formatMessage(messages.pageDeletionConfirmation);
    event.preventDefault();
    if (window.confirm(deleteMessage)) {
      deletePage(pageId);
    }
  };

  return (
    <>
      <PageTitle>
        <FormattedMessage {...messages.listTitle} />
      </PageTitle>

      <PageWrapper>
        <FeatureFlag name="pages">
          <ButtonWrapper>
            <Button
              buttonStyle="cl-blue"
              icon="plus-circle"
              linkTo="/admin/pages/new"
            >
              <FormattedMessage {...messages.addPageButton} />
            </Button>
          </ButtonWrapper>
        </FeatureFlag>
        <List key={pages.length}>
          {customPages
            .filter((page) => {
              // These pages are only changeable in Crowdin.
              // Changing them here wouldn't have any effect.
              // So to avoid confusion, they're not shown.
              return (
                page.attributes.slug !== 'homepage_info' &&
                page.attributes.slug !== 'cookie-policy' &&
                page.attributes.slug !== 'accessibility-statement'
              );
            })
            .map((page) => (
              <Row key={page.id} id={page.id}>
                <TextCell className="expand">
                  <T value={page.attributes.title_multiloc} />
                </TextCell>
                <Button
                  onClick={handleOnDeleteClick(page.id)}
                  buttonStyle="text"
                  icon="delete"
                >
                  <FormattedMessage {...messages.deleteButtonLabel} />
                </Button>
                <Button
                  linkTo={`/pages/${page.attributes.slug}`}
                  buttonStyle="text"
                  icon="search"
                >
                  <FormattedMessage {...messages.showButtonLabel} />
                </Button>
                <Button
                  linkTo={`/admin/pages/${page.id}`}
                  buttonStyle="secondary"
                  icon="edit"
                >
                  <FormattedMessage {...messages.editButtonLabel} />
                </Button>
              </Row>
            ))}
        </List>
      </PageWrapper>
    </>
  );
};

export default injectIntl(Pages);
