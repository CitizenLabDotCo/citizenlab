import React from 'react';
import Button from 'components/UI/Button';
import { fontSizes } from 'utils/styleUtils';

// i18n
import messages from '../../messages';
import { FormattedMessage } from 'utils/cl-intl';
import { isString } from 'lodash-es';
import { trackEventByName } from 'utils/analytics';
import { requestBlob } from 'utils/request';
import { API_PATH } from 'containers/App/constants';
import tracks from '../../tracks';
import { exportType } from '../ExportMenu';
import { saveAs } from 'file-saver';

interface Props {
  exportQueryParameter: 'all' | string | string[];
  exportType: exportType;
}

interface State {
  exporting: boolean;
}

export default class ExportCommentsButton extends React.PureComponent<
  Props,
  State
> {
  constructor(props: Props) {
    super(props);
    this.state = {
      exporting: false,
    };
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
      this.setState({ exporting: true });
      const blob = await requestBlob(
        `${API_PATH}/ideas/comments/as_xlsx`,
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        queryParametersObject
      );
      saveAs(blob, 'comments-export.xlsx');
      this.setState({ exporting: false });
    } catch (error) {
      this.setState({ exporting: false });
    }

    // track this click for user analytics
    trackEventByName(tracks.clickExportComments.name);
  };

  render() {
    const { exportType } = this.props;
    const { exporting } = this.state;
    return (
      <Button
        buttonStyle="text"
        onClick={this.handleExportComments}
        processing={exporting}
        padding="0"
        fontSize={`${fontSizes.small}px`}
      >
        {exportType === 'all' && (
          <FormattedMessage {...messages.exportIdeasComments} />
        )}
        {exportType === 'project' && (
          <FormattedMessage {...messages.exportIdeasCommentsProjects} />
        )}
        {exportType === 'selected_posts' && (
          <FormattedMessage {...messages.exportSelectedInputsComments} />
        )}
      </Button>
    );
  }
}
