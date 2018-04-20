import React from 'react';
import { browserHistory } from 'react-router';

import GoBackButton from 'components/UI/GoBackButton';
import { Section, SectionTitle } from 'components/admin/Section';
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

export default class Edit extends React.PureComponent {
  goBack = () => {
    browserHistory.push('/admin/settings/areas');
  }

  render() {
    return (
      <Section>
        <GoBackButton onClick={this.goBack} />
        <SectionTitle>
          <FormattedMessage {...messages.editFormTitle} />
        </SectionTitle>
      </Section>
    )
  }
}
