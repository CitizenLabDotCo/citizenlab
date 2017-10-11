// Libraries
import * as React from 'react';
import * as Rx from 'rxjs/Rx';
import * as _ from 'lodash';

// i18n
import { FormattedMessage } from 'react-intl';
import { injectTFunc } from 'components/T/utils';
import { getLocalized } from 'utils/i18n';
import messages from './messages';

// Components
import Radio from 'components/UI/Radio';
import FieldWrapper from 'components/admin/FieldWrapper';

// Style
import styled from 'styled-components';

// Typing
interface Props {
  tFunc: Function;
}

interface State {

}

class ProjectPermissions extends React.Component<Props, State> {

  handlePermissionTypeChange = (value) => {
    console.log(value);
  }

  render() {
    const { tFunc } = this.props;

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
            label={tFunc(messages.permissionsEveryoneLabel)}
            value="all"
            id="permissions-all"
          />
          <Radio
            onChange={this.handlePermissionTypeChange}
            currentValue=""
            name="permissionsType"
            label={tFunc(messages.permissionsSelectionLabel)}
            value="selection"
            id="permissions-selection"
          />
        </FieldWrapper>
      </div>
    );
  }
}

export default injectTFunc(ProjectPermissions);
