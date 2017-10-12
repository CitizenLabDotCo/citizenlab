// Libraries
import * as React from 'react';
import * as Rx from 'rxjs/Rx';
import * as _ from 'lodash';

// i18n
import { injectIntl, InjectedIntlProps, FormattedMessage } from 'react-intl';
import { getLocalized } from 'utils/i18n';
import messages from './messages';

// Components
import Radio from 'components/UI/Radio';
import FieldWrapper from 'components/admin/FieldWrapper';

// Style
import styled from 'styled-components';

// Typing
interface Props {
}

interface State {

}

class ProjectPermissions extends React.Component<Props & InjectedIntlProps, State> {

  handlePermissionTypeChange = (value) => {
    console.log(value);
  }

  render() {
    const { formatMessage } = this.props.intl;

    return (
      <div>
        <h1><FormattedMessage {...messages.permissionsTitle} /></h1>
        <p><FormattedMessage {...messages.permissionsSubtitle} /></p>

        <FieldWrapper>
          <label htmlFor="permissions-type">
            <FormattedMessage {...messages.permissionTypeLabel} />
          </label>
          <Radio
            onChange={this.handlePermissionTypeChange}
            currentValue=""
            name="permissionsType"
            label={formatMessage(messages.permissionsEveryoneLabel)}
            value="all"
            id="permissions-all"
          />
          <Radio
            onChange={this.handlePermissionTypeChange}
            currentValue=""
            name="permissionsType"
            label={formatMessage(messages.permissionsSelectionLabel)}
            value="selection"
            id="permissions-selection"
          />
        </FieldWrapper>
      </div>
    );
  }
}

export default injectIntl(ProjectPermissions);
