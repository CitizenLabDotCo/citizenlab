// Libraries
import React from 'react';
// typings
import { IParticipationContextType } from 'typings';
import { exportVolunteers } from 'services/volunteers';
// i18n
import { FormattedMessage } from 'utils/cl-intl';
// components
import Button from 'components/UI/Button';
import messages from './messages';

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
