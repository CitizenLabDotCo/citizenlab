import React, { PureComponent } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { adopt } from 'react-adopt';

// components
import Table from 'components/UI/Table';
import CustomPagination from 'components/admin/Pagination/CustomPagination';
import { PageTitle } from 'components/admin/Section';

// resources
import GetModerations, { GetModerationsChildProps } from 'resources/GetModerations';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';
import T from 'components/T';

// styling
import styled from 'styled-components';
// import { colors, fontSizes } from 'utils/styleUtils';

// typings
import { globalState, IGlobalStateService, IAdminFullWidth } from 'services/globalState';

const Container = styled.div`
  border: solid 1px red;
`;

const StyledPageTitle = styled(PageTitle)`
  margin-bottom: 30px;
`;

const StyledTable = styled(Table)`
  border: solid 1px red;

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

    &.type {
      padding-left: 0px;
    }

    &.content {
      max-width: calc(100vw - 1200px);
    }
  }
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
  globalState: IGlobalStateService<IAdminFullWidth>;

  constructor(props) {
    super(props);
    this.globalState = globalState.init('AdminFullWidth');
  }

  componentDidMount() {
    this.globalState.set({ enabled: true });
  }

  componentWillUnmount() {
    this.globalState.set({ enabled: false });
  }

  handlePaginationClick = (pageNumber: number) => {
    this.props.moderations.onChangePage(pageNumber);
  }

  render() {
    if (!isNilOrError(this.props.moderations?.list)) {
      const { moderations: { list, currentPage, lastPage } } = this.props;

      return (
        <Container className={this.props.className}>
          <StyledPageTitle>
            <FormattedMessage {...messages.pageTitle} />
          </StyledPageTitle>

          <StyledTable>
            <thead>
              <tr>
                <th className="type">
                  <FormattedMessage {...messages.type} />
                </th>
                <th className="context">
                  <FormattedMessage {...messages.context} />
                </th>
                <th className="content">
                  <FormattedMessage {...messages.content} />
                </th>
                <th className="date">
                  <FormattedMessage {...messages.date} />
                </th>
              </tr>
            </thead>
            <tbody>
              {list.map((listItem, index) => {
                return (
                  <tr key={index}>
                    <td className="type nowrap">{listItem.type}</td>
                    <td className="context">
                      <T value={listItem.attributes.context_multiloc} />
                    </td>
                    <td className="content">
                      <T value={listItem.attributes.content_multiloc}>
                        {content => <div dangerouslySetInnerHTML={{ __html: content }} />}
                      </T>
                    </td>
                    <td className="date nowrap">{listItem.attributes.created_at}</td>
                  </tr>
                );
              })}
            </tbody>
          </StyledTable>

          <CustomPagination
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
  moderations: <GetModerations pageSize={4} />
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataprops => <Moderation {...inputProps} {...dataprops} />}
  </Data>
);
