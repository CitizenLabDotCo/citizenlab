import React, { PureComponent } from 'react';

// components
import Table from 'components/UI/Table';
import CustomPagination from 'components/admin/Pagination/CustomPagination';
import { PageTitle } from 'components/admin/Section';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

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

interface Props {
  className?: string;
}

interface State {}

class Moderation extends PureComponent<Props, State> {
  globalState: IGlobalStateService<IAdminFullWidth>;

  constructor(props) {
    super(props);
    this.state = {
      activeComparisonCount: 0,
      selectedNodes: [[]],
    };
    this.globalState = globalState.init('AdminFullWidth');
  }

  componentDidMount() {
    this.globalState.set({ enabled: true });
  }

  componentWillUnmount() {
    this.globalState.set({ enabled: false });
  }

  handlePaginationClick = () => {
    // empty
  }

  render() {
    const currentPage = 1;
    const lastPage = 10;
    const moderationData = [
      {
        type: 'idea',
        context: 'A random idea',
        content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed posuere velit sed vulputate varius. Mauris ac turpis est. Sed et gravida risus. Curabitur porttitor, nisi id pulvinar maximus, ipsum lorem posuere est, a gravida justo tortor vel diam. Nulla sed mollis turpis. Pellentesque ac lorem ultricies, iaculis massa non, fermentum nisi. In iaculis felis ut sagittis feugiat. Nulla facilisi. Cras molestie eget massa sit amet cursus. Nullam a justo eget felis facilisis maximus vitae vel est. Phasellus vehicula massa erat. Praesent ut dui eget orci iaculis lacinia. Proin ac magna augue. Donec molestie dolor in lacus eleifend, at posuere arcu ultrices. Nam id erat et arcu scelerisque mattis at ut neque. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.',
        date: '2011-10-05T14:48:00.000Z'
      },
      {
        type: 'idea',
        context: 'A random idea',
        content: 'Lorem ipsum dolor',
        date: '2011-10-05T14:48:00.000Z'
      },
      {
        type: 'idea',
        context: 'A random idea',
        content: 'Ut tellus massa, rutrum sed dignissim non, commodo id ante. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Donec et ante magna. Donec a lectus interdum tortor consectetur fringilla. Phasellus augue augue, ultrices quis erat quis, porttitor sodales magna. Proin id purus sapien. Phasellus nec sapien eget diam tristique venenatis in in justo.',
        date: '2011-10-05T14:48:00.000Z'
      },
      {
        type: 'idea',
        context: 'A random idea',
        content: 'Nulla sollicitudin vitae eros vitae dignissim. Mauris ipsum lacus, suscipit vel pellentesque a, rutrum sit amet lorem. Morbi vel felis enim. Vivamus ac lectus eros. Curabitur vestibulum id enim ullamcorper porttitor. Vestibulum efficitur lorem in turpis ullamcorper, at molestie lorem vulputate. Phasellus a sagittis nisl. Morbi rhoncus augue sed nisi imperdiet interdum a a est. Aenean blandit porta erat, a aliquam mi tincidunt in. Maecenas sit amet nulla nec felis tristique vestibulum tempus sed sapien. Nulla nec metus quis odio laoreet pharetra. Maecenas id pulvinar leo. Etiam faucibus interdum odio vel vehicula. Ut quis imperdiet risus. Integer dignissim dictum mauris, vitae laoreet arcu posuere volutpat.',
        date: '2011-10-05T14:48:00.000Z'
      }
    ];

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
            {moderationData.map((item, index) => {
              return (
                <tr key={index}>
                  <td className="type nowrap">{item.type}</td>
                  <td className="context">{item.context}</td>
                  <td className="content">{item.content}</td>
                  <td className="date nowrap">{item.date}</td>
                </tr>
              );
            })}
          </tbody>
        </StyledTable>

        <CustomPagination
          currentPage={currentPage || 1}
          totalPages={lastPage || 1}
          loadPage={this.handlePaginationClick}
        />
      </Container>
    );
  }
}

export default Moderation;
