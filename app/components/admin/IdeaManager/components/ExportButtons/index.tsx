import React from 'react';
import { isString } from 'lodash-es';
import styled from 'styled-components';
import { API_PATH } from 'containers/App/constants';
import { requestBlob } from 'utils/request';
import { saveAs } from 'file-saver';

// analytics
import { injectTracks } from 'utils/analytics';
import tracks from '../../tracks';

// components
import ExportIdeasButton from './ExportIdeasButton';
import ExportCommentsButton from './ExportCommentsButton';

const Container = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: flex-end;

  & > *:not(:last-child) {
    margin-right: 15px;
  }
`;

interface Props {
  exportType: string;
  exportQueryParameter: 'all' | string | string[];
  className?: string;
}

interface ITracks {
  clickExportIdeas: () => void;
  clickExportComments: () => void;
}

interface State {
  exportingIdeas: boolean;
  exportingComments: boolean;
}

class ExportButtons extends React.PureComponent<Props & ITracks, State> {

  constructor(props: Props & ITracks) {
    super(props);
    this.state = {
      exportingIdeas: false,
      exportingComments: false
    };
  }

  handleExportIdeas = async () => {
    const { exportQueryParameter: queryParameter, clickExportIdeas } = this.props;

    const queryParametersObject = {};
    if (isString(queryParameter) && queryParameter !== 'all') {
      queryParametersObject['project'] = queryParameter;
    } else if (!isString(queryParameter)) {
      queryParametersObject['ideas'] = queryParameter;
    }

    try {
      this.setState({ exportingIdeas: true });
      const blob = await requestBlob(`${API_PATH}/ideas/as_xlsx`, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', queryParametersObject);
      saveAs(blob, 'ideas-export.xlsx');
      this.setState({ exportingIdeas: false });
    } catch (error) {
      this.setState({ exportingIdeas: false });
    }

    // track this click for user analytics
    clickExportIdeas();
  }

  handleExportComments = async () => {
    const { exportQueryParameter: queryParameter, clickExportComments } = this.props;

    const queryParametersObject = {};
    if (isString(queryParameter) && queryParameter !== 'all') {
      queryParametersObject['project'] = queryParameter;
    } else if (!isString(queryParameter)) {
      queryParametersObject['ideas'] = queryParameter;
    }

    try {
      this.setState({ exportingComments: true });
      const blob = await requestBlob(`${API_PATH}/comments/as_xlsx`, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', queryParametersObject);
      saveAs(blob, 'comments-export.xlsx');
      this.setState({ exportingComments: false });
    } catch (error) {
      this.setState({ exportingComments: false });
    }

    // track this click for user analytics
    clickExportComments();
  }

  render() {
    const { exportType, className } = this.props;
    const { exportingIdeas, exportingComments } = this.state;
    return (
      <Container className={className}>
        <ExportIdeasButton
          exportingIdeas={exportingIdeas}
          exportType={exportType}
          onClick={this.handleExportIdeas}
        />
        <ExportCommentsButton
          exportingComments={exportingComments}
          exportType={exportType}
          onClick={this.handleExportComments}
        />
      </Container>
    );
  }
}

export default injectTracks<Props>(tracks)(ExportButtons);
