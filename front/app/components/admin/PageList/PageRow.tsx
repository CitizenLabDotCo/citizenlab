import React from 'react';
import styled from 'styled-components';

// services
import { deletePage } from 'services/pages';

// components
import { Icon } from 'cl2-component-library';
import { Row, TextCell } from 'components/admin/ResourceList';
import Button from 'components/UI/Button';
import T from 'components/T';

// i18n
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

// typings
import { IPageData } from 'services/pages';

const LockIcon = styled(Icon)`
  height: 18px;
  margin-right: 16px;
`;

interface Props {
  page: IPageData;
}

export default injectIntl(
  ({ page, intl: { formatMessage } }: Props & InjectedIntlProps) => {
    const handleOnDeleteClick = (event) => {
      const deleteMessage = formatMessage(messages.pageDeletionConfirmation);
      event.preventDefault();

      if (window.confirm(deleteMessage)) {
        deletePage(page.id);
      }
    };

    return (
      <Row id={page.id}>
        <TextCell className="expand">
          <LockIcon name="lock" />
          <T value={page.attributes.title_multiloc} />
        </TextCell>

        <Button onClick={handleOnDeleteClick} buttonStyle="text" icon="delete">
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
    );
  }
);
