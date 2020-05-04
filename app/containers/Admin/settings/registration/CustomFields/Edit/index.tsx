import React from 'react';
import styled from 'styled-components';
import { withRouter, WithRouterProps } from 'react-router';
import clHistory from 'utils/cl-router/history';
import { isNilOrError } from 'utils/helperUtils';
import { ICustomFieldData, isBuiltInField } from 'services/userCustomFields';
import GetCustomField, { GetCustomFieldChildProps } from 'resources/GetCustomField';
import GoBackButton from 'components/UI/GoBackButton';
import TabbedResource from 'components/admin/TabbedResource';
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from '../messages';
import injectLocalize, { InjectedLocalized } from 'utils/localize';

const StyledGoBackButton = styled(GoBackButton)`
  display: flex;
  margin-bottom: 20px;
`;

export interface InputProps {}

interface DataProps {
  customField: GetCustomFieldChildProps;
}

interface Props extends InputProps, DataProps {}

class Edit extends React.Component<Props & WithRouterProps & InjectedIntlProps & InjectedLocalized> {

  hasOptions = (inputType) => {
    return inputType === 'select' || inputType === 'multiselect';
  }

  goBack = () => {
    clHistory.push('/admin/settings/registration');
  }

  getTabs = (customField: ICustomFieldData) => {
    const baseTabsUrl = `/admin/settings/registration/custom_fields/${customField.id}`;

    const tabs = [
      {
        label: this.props.intl.formatMessage(messages.generalTab),
        url: `${baseTabsUrl}/general`,
        className: 'general',
      },
    ];

    if (this.hasOptions(customField.attributes.input_type) && !isBuiltInField(customField)) {
      tabs.push({
        label: this.props.intl.formatMessage(messages.optionsTab),
        url: `${baseTabsUrl}/options`,
        className: 'options',
      });
    }

    return tabs;
  }

  render() {
    const { customField, children, localize } = this.props;
    const childrenWithExtraProps = React.cloneElement(children as React.ReactElement<any>, { customField });

    return !isNilOrError(customField) && (
      <>
        <StyledGoBackButton onClick={this.goBack} />
        <TabbedResource
          tabs={this.getTabs(customField)}
          resource={{
            title: localize(customField.attributes.title_multiloc),
            publicLink: '',
          }}
          messages={{
            viewPublicResource: messages.addOptionButton
          }}
        >
          {childrenWithExtraProps}
        </TabbedResource>
      </>
    );
  }
}

const EditWithHOCs = injectIntl(injectLocalize(Edit));

export default withRouter((inputProps: InputProps & WithRouterProps & InjectedIntlProps & InjectedLocalized) => (
  <GetCustomField id={inputProps.params.customFieldId}>
    {customField => <EditWithHOCs {...inputProps} customField={customField} />}
  </GetCustomField>
));
