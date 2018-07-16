import React, { PureComponent } from 'react';

// components
import FilterSelector from 'components/FilterSelector';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

type Props = {
  id?: string | undefined;
  onChange: (value: string) => void;
};

type State = {
  selectedValue: string[];
};

class SelectPublicationStatus extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props as any);
    this.state = {
      selectedValue: ['trending']
    };
  }

  handleOnChange = (selectedValue: string[]) => {
    this.setState({ selectedValue });
    this.props.onChange(selectedValue[0]);
  }

  render() {
    const { selectedValue } = this.state;
    const options = [
      { text: <FormattedMessage {...messages.allProjects} />, value: 'all' },
      { text: <FormattedMessage {...messages.activeProjects} />, value: 'active' },
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
        maxWidth={'250px'}
        mobileMaxWidth={'180px'}
      />
    );
  }
}

export default SelectPublicationStatus;
