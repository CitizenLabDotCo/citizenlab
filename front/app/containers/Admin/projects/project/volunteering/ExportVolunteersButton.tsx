// Libraries
import React from 'react';

// typings
import { IParticipationContextType } from 'typings';

// components
import Button from 'components/UI/Button';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';
import { exportVolunteers } from 'services/volunteers';

interface Props {
  participationContextType: IParticipationContextType;
  participationContextId: string;
  className?: string;
}

interface State {
  exporting: boolean;
}

export default class ExportVolunteersButton extends React.PureComponent<
  Props,
  State
> {
  constructor(props: Props) {
    super(props);
    this.state = {
      exporting: false,
    };
  }

  handleExportVolunteers = async () => {
    this.setState({ exporting: true });
    await exportVolunteers(
      this.props.participationContextId,
      this.props.participationContextType
    );
    this.setState({ exporting: false });
  };

  render() {
    const { className } = this.props;
    const { exporting } = this.state;
    return (
      <Button
        buttonStyle="secondary"
        icon="download"
        onClick={this.handleExportVolunteers}
        processing={exporting}
        className={className}
      >
        <FormattedMessage {...messages.exportVolunteers} />
      </Button>
    );
  }
}
