import React from 'react';

// components
import PageWrapper from 'components/admin/PageWrapper';
import IdeaManager from 'components/admin/IdeaManager';
import IdeaButton from 'components/IdeaButton';
import { PageTitle, SectionSubtitle } from 'components/admin/Section';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// utils
import { API_PATH } from 'containers/App/constants';
import { requestBlob } from 'utils/request';

// styling
import styled from 'styled-components';

const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 0;
  margin: 0;
  margin-bottom: 30px;
`;

const Left = styled.div`
  margin-right: 80px;
`;

export interface Props {}

export interface ITracks {
  clickExportAllIdeas: () => void;
  clickExportAllComments: () => void;
}

interface State {
  exportingIdeas: boolean;
  exportingComments: boolean;
}

export default class AllIdeas extends React.PureComponent<Props & ITracks, State> {
  constructor(props: Props & ITracks) {
    super(props);
    this.state = {
      exportingIdeas: false,
      exportingComments: false,
    };
  }

  handleExportIdeas = async () => {
    // track this click for user analytics
    this.props.clickExportAllIdeas();
    try {
      this.setState({ exportingIdeas: true });
      const blob = await requestBlob(`${API_PATH}/ideas/as_xlsx`, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      saveAs(blob, 'ideas-export.xlsx');
      this.setState({ exportingIdeas: false });
    } catch (error) {
      this.setState({ exportingIdeas: false });
    }
  }

  handleExportComments = async () => {
    // track this click for user analytics
    this.props.clickExportAllComments();
    try {
      this.setState({ exportingComments: true });
      const blob = await requestBlob(`${API_PATH}/comments/as_xlsx`, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      saveAs(blob, 'comments-export.xlsx');
      this.setState({ exportingComments: false });

    } catch (error) {
      this.setState({ exportingComments: false });
    }
  }

  render() {
    return (
      <>
        <HeaderContainer>
          <Left>
            <PageTitle>
              <FormattedMessage {...messages.header} />
            </PageTitle>
            <SectionSubtitle>
              <FormattedMessage {...messages.headerSubtitle} />
            </SectionSubtitle>
          </Left>
          <IdeaButton />
        </HeaderContainer>

        <PageWrapper>
          <IdeaManager />
        </PageWrapper>
      </>
    );
  }
}
