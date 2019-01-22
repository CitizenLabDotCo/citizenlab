import React, { PureComponent } from 'react';

// components
import FilterSelector from 'components/FilterSelector';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// typings
import { SelectedPublicationStatus } from 'resources/GetProjects';

type Props = {
  id?: string | undefined;
  onChange: (value: SelectedPublicationStatus) => void;
};

type State = {
  selectedValue: [SelectedPublicationStatus];
};

class SelectPublicationStatus extends PureComponent<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      selectedValue: ['all']
    };
  }

  handleOnChange = (selectedValue: [SelectedPublicationStatus]) => {
    this.setState({ selectedValue });
    this.props.onChange(selectedValue[0]);
  }

  render() {
    const { selectedValue } = this.state;
    const options: {
      text: JSX.Element,
      value: SelectedPublicationStatus
    }[] = [
      { text: <FormattedMessage {...messages.allProjects} />, value: 'all' },
      { text: <FormattedMessage {...messages.activeProjects} />, value: 'published' },
      { text: <FormattedMessage {...messages.archivedProjects} />, value: 'archived' },
    ];

    return (
      <FilterSelector
        title={<FormattedMessage {...messages.publicationStatus} />}
        name="publicationstatus"
        selected={selectedValue}
        values={options}
        onChange={this.handleOnChange}
        multiple={false}
        left="-5px"
        mobileLeft="-5px"
      />
    );
  }
}

export default SelectPublicationStatus;
