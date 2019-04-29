import React from 'react';
import { isString } from 'lodash-es';
import styled from 'styled-components';
import { API_PATH } from 'containers/App/constants';
import { requestBlob } from 'utils/request';
import { saveAs } from 'file-saver';

// analytics
import { trackEventByName } from 'utils/analytics';
import tracks from '../../tracks';

// components
import ExportIdeasButton from './ExportIdeasButton';
import ExportCommentsButton from './ExportCommentsButton';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 10px;

  & > *:not(:last-child) {
    margin-bottom: 20px;
  }
`;

interface Props {
  exportType: 'selected_ideas' | 'project' | 'all';
  exportQueryParameter: 'all' | string | string[];
  className?: string;
}

interface State {
  exportingIdeas: boolean;
  exportingComments: boolean;
}

class ExportButtons extends React.PureComponent<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
      exportingIdeas: false,
      exportingComments: false
    };
  }

  handleExportIdeas = async () => {
    const { exportQueryParameter: queryParameter } = this.props;

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
    trackEventByName(tracks.clickExportIdeas.name);
  }

  handleExportComments = async () => {
    const { exportQueryParameter: queryParameter } = this.props;

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
    trackEventByName(tracks.clickExportComments.name);
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

export default ExportButtons;
