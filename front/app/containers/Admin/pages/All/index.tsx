import React from 'react';
import styled from 'styled-components';
import { isNilOrError } from 'utils/helperUtils';

// services
import {
  deletePage,
  STANDARD_PAGES,
  IPageData,
  TPageCode,
} from 'services/pages';

// hooks
import usePages from 'hooks/usePages';

// i18n
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

const ALLOWED_PAGES = new Set<TPageCode>([
  ...STANDARD_PAGES,
  'proposals',
  'custom',
]);

const isAllowedPage = ({ attributes: { code } }: IPageData) =>
  ALLOWED_PAGES.has(code);

const NON_DELETEABLE_PAGES = new Set<TPageCode>([
  ...STANDARD_PAGES,
  'proposals',
]);

const isDeletablePage = ({ attributes: { code } }: IPageData) =>
  !NON_DELETEABLE_PAGES.has(code);

const Pages = ({ intl: { formatMessage } }: InjectedIntlProps) => {
  const pages = usePages();

  const handleOnDeleteClick = (pageId: string) => (event) => {
    const deleteMessage = formatMessage(messages.pageDeletionConfirmation);
    event.preventDefault();
    if (window.confirm(deleteMessage)) {
      deletePage(pageId);
    }
  };

  if (!isNilOrError(pages)) {
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
            {pages.filter(isAllowedPage).map((page) => (
              <Row key={page.id} id={page.id}>
                <TextCell className="expand">
                  <T value={page.attributes.title_multiloc} />
                </TextCell>
                {isDeletablePage(page) && (
                  <Button
                    onClick={handleOnDeleteClick(page.id)}
                    buttonStyle="text"
                    icon="delete"
                  >
                    <FormattedMessage {...messages.deleteButtonLabel} />
                  </Button>
                )}
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
  }

  return null;
};

export default injectIntl(Pages);
