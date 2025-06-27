import React from 'react';

import { fontSizes } from '@citizenlab/cl2-component-library';
import { saveAs } from 'file-saver';
import { isString } from 'lodash-es';
import { WrappedComponentProps } from 'react-intl';

import { API_PATH } from 'containers/App/constants';

import ButtonWithLink from 'components/UI/ButtonWithLink';

import { trackEventByName } from 'utils/analytics';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { requestBlob } from 'utils/requestBlob';

import messages from '../../messages';
import tracks from '../../tracks';
import { exportType } from '../ExportMenu';

interface Props {
  exportQueryParameter: 'all' | string | string[];
  exportType: exportType;
}

interface State {
  exporting: boolean;
}

class ExportCommentsButton extends React.PureComponent<
  Props & WrappedComponentProps,
  State
> {
  constructor(props: Props & WrappedComponentProps) {
    super(props);
    this.state = {
      exporting: false,
    };
  }

  handleExportComments = async () => {
    const {
      exportQueryParameter: queryParameter,
      intl: { formatDate, formatMessage },
    } = this.props;

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
      saveAs(
        blob,
        `${formatMessage(messages.inputCommentsExportFileName)}_${formatDate(
          Date.now()
        )}.xlsx`
      );
      this.setState({ exporting: false });
    } catch (error) {
      this.setState({ exporting: false });
    }

    // track this click for user analytics
    trackEventByName(tracks.clickExportComments);
  };

  render() {
    const { exportType } = this.props;
    const { exporting } = this.state;
    return (
      <ButtonWithLink
        buttonStyle="text"
        onClick={this.handleExportComments}
        processing={exporting}
        padding="0"
        fontSize={`${fontSizes.s}px`}
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
      </ButtonWithLink>
    );
  }
}

export default injectIntl(ExportCommentsButton);
