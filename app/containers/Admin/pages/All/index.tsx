import React from 'react';
import styled from 'styled-components';
import { isNilOrError } from 'utils/helperUtils';

import { deletePage } from 'services/pages';

import GetPages, { GetPagesChildProps } from 'resources/GetPages';

import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import T from 'components/T';

import { List, Row, TextCell } from 'components/admin/ResourceList';
import Button from 'components/UI/Button';

import messages from '../messages';
import FeatureFlag from 'components/FeatureFlag';
import PageWrapper from 'components/admin/PageWrapper';

const PageTitle = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 3rem;
`;

const ButtonWrapper = styled.div`
  margin-top: 2rem;
`;


interface InputProps {}

interface DataProps {
  pages: GetPagesChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {}

class Pages extends React.Component<Props & InjectedIntlProps, State> {

  handleOnDeleteClick = (pageId) => (event) => {
    const deleteMessage = this.props.intl.formatMessage(messages.pageDeletionConfirmation);
    event.preventDefault();
    if (window.confirm(deleteMessage)) {
      deletePage(pageId);
    }
  }

  isBuiltInPage = (page) => {
    return page && false;
  }

  render() {
    const pages = this.props.pages;

    if (isNilOrError(pages)) return null;

    return (
      <>
        <PageTitle>
          <FormattedMessage {...messages.listTitle} />
        </PageTitle>

        <PageWrapper>
          <FeatureFlag name="pages">
            <ButtonWrapper>
              <Button
                style="cl-blue"
                circularCorners={false}
                icon="plus-circle"
                linkTo="/admin/pages/new"
              >
                <FormattedMessage {...messages.addPageButton} />
              </Button>
            </ButtonWrapper>
          </FeatureFlag>
          <List key={pages.length}>
            {pages.map((page) => (
              <Row
                key={page.id}
                id={page.id}
              >
                <TextCell className="expand">
                  <T value={page.attributes.title_multiloc} />
                </TextCell>
                <Button onClick={this.handleOnDeleteClick(page.id)} style="text" circularCorners={false} icon="delete">
                  <FormattedMessage {...messages.deleteButtonLabel} />
                </Button>
                <Button linkTo={`/pages/${page.attributes.slug}`} style="text" circularCorners={false} icon="search">
                  <FormattedMessage {...messages.showButtonLabel} />
                </Button>
                <Button linkTo={`/admin/pages/${page.id}`} style="secondary" circularCorners={false} icon="edit">
                  <FormattedMessage {...messages.editButtonLabel} />
                </Button>
              </Row>
            ))}
          </List>
        </PageWrapper>
      </>
    );
  }
}

const PagesWithInjectedIntl = injectIntl<Props>(Pages);

export default (inputProps: Props) => (
  <GetPages>
    {pages => <PagesWithInjectedIntl {...inputProps} pages={pages} />}
  </GetPages>
);
