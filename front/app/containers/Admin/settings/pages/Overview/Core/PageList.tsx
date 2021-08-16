import React from 'react';

// services
import { deletePage } from 'services/pages';

// components
import { List, Row, TextCell } from 'components/admin/ResourceList';
import Button from 'components/UI/Button';
import T from 'components/T';

// i18n
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from '../../messages';

// typings
import { IPageData } from 'services/pages';

interface Props {
  pages: IPageData[];
}

export default injectIntl(
  ({ pages, intl: { formatMessage } }: Props & InjectedIntlProps) => {
    const handleOnDeleteClick = (pageId: string) => (event) => {
      const deleteMessage = formatMessage(messages.pageDeletionConfirmation);
      event.preventDefault();

      if (window.confirm(deleteMessage)) {
        deletePage(pageId);
      }
    };

    return (
      <List key={pages.length}>
        {pages
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
    );
  }
);
