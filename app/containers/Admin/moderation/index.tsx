import React, { PureComponent } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { adopt } from 'react-adopt';
import moment from 'moment';

// components
import Table from 'components/UI/Table';
import Pagination from 'components/admin/Pagination/Pagination';
import { PageTitle } from 'components/admin/Section';

// resources
import GetModerations, { GetModerationsChildProps } from 'resources/GetModerations';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';
import T from 'components/T';

// styling
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';

const Container = styled.div`
  margin-bottom: 100px;
`;

const PageTitleWrapper = styled.div`
  display: flex;
  align-items: flex-end;
  margin-bottom: 60px;
`;

const StyledPageTitle = styled(PageTitle)`
  line-height: ${fontSizes.xxxl}px;
  margin-bottom: 0px;
`;

const BetaLabel = styled.span`
  color: ${colors.clIconAccent};
  font-size: ${fontSizes.medium}px;
  line-height: ${fontSizes.medium + 4}px;
  font-weight: 600;
  margin-left: 8px;
`;

const StyledTable = styled(Table)`
  th,
  td {
    text-align: left;
    vertical-align: top;
    padding-left: 10px;
    padding-right: 10px;
    overflow-wrap: normal;

    &.nowrap {
      overflow-wrap: normal;
      white-space: nowrap;
    }

    &.date {
      padding-right: 20px;
    }

    &.type {
      padding-right: 20px;
    }

    &.content {
      width: calc(100vw - 900px);
    }
  }
`;

const StyledPagination = styled(Pagination)`
  margin-top: 40px;
`;

interface InputProps {
  className?: string;
}

interface DataProps {
  moderations: GetModerationsChildProps;
}

interface Props extends InputProps, DataProps { }

interface State {}

class Moderation extends PureComponent<Props, State> {

  handlePaginationClick = (pageNumber: number) => {
    this.props.moderations.onChangePage(pageNumber);
  }

  render() {
    if (!isNilOrError(this.props.moderations?.list)) {
      const { moderations: { list, currentPage, lastPage } } = this.props;

      return (
        <Container className={this.props.className}>
          <PageTitleWrapper>
            <StyledPageTitle>
              <FormattedMessage {...messages.pageTitle} />
            </StyledPageTitle>
            <BetaLabel>(Beta)</BetaLabel>
          </PageTitleWrapper>

          <StyledTable>
            <thead>
              <tr>
                <th className="date">
                  <FormattedMessage {...messages.date} />
                </th>
                <th className="type">
                  <FormattedMessage {...messages.type} />
                </th>
                <th className="context">
                  <FormattedMessage {...messages.context} />
                </th>
                <th className="content">
                  <FormattedMessage {...messages.content} />
                </th>
              </tr>
            </thead>
            <tbody>
              {list.map((listItem, index) => {
                return (
                  <tr key={index}>
                    <td className="date nowrap">
                      {moment(listItem.attributes.created_at).format('LLL')}
                    </td>
                    <td className="type nowrap">
                      {listItem.attributes.context_type}
                    </td>
                    <td className="context">
                      <a href={listItem.attributes.context_url} role="button">
                        <T value={listItem.attributes.context_multiloc} />
                      </a>
                    </td>
                    <td className="content">
                      <T value={listItem.attributes.content_multiloc}>
                        {content => <div dangerouslySetInnerHTML={{ __html: content }} />}
                      </T>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </StyledTable>

          <StyledPagination
            currentPage={currentPage}
            totalPages={lastPage}
            loadPage={this.handlePaginationClick}
          />
        </Container>
      );
    }

    return null;
  }
}

const Data = adopt<DataProps, InputProps>({
  moderations: <GetModerations pageSize={8} />
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataprops => <Moderation {...inputProps} {...dataprops} />}
  </Data>
);
