import React from 'react';
import Button from 'components/UI/Button';
import { fontSizes } from 'utils/styleUtils';

// i18n
import messages from '../../messages';
import { FormattedMessage } from 'utils/cl-intl';

interface State {}

interface Props {
  onClick: () => void;
  exportingComments: boolean;
  exportType: string;
}

export default class ExportCommentsButton extends React.PureComponent<Props, State> {
  render() {
    const { onClick, exportingComments, exportType } = this.props;
    return (
      <Button
        style="text"
        onClick={onClick}
        processing={exportingComments}
        padding="0"
        fontSize={`${fontSizes.small}px`}
      >
        {exportType === 'all' && <FormattedMessage {...messages.exportComments} />}
        {exportType === 'project' && <FormattedMessage {...messages.exportCommentsProjects} />}
        {exportType === 'selected_ideas' && <FormattedMessage {...messages.exportSelectedComments} />}
      </Button>
    );
  }
}
