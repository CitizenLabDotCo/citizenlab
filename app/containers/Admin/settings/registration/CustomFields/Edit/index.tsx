import React from 'react';
import styled from 'styled-components';
import { withRouter, WithRouterProps, browserHistory } from 'react-router';
import { ICustomFieldData } from 'services/userCustomFields';
import GetCustomField, { GetCustomFieldChildProps } from 'resources/GetCustomField';
import GoBackButton from 'components/UI/GoBackButton';
import TabbedResource from 'components/admin/TabbedResource';
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from '../messages';

const StyledGoBackButton = styled(GoBackButton)`
  margin-bottom: 20px;
`;

interface InputProps {}

interface DataProps {
  customField: GetCustomFieldChildProps;
}

interface Props extends InputProps, DataProps {}

class Edit extends React.Component<Props & WithRouterProps & InjectedIntlProps> {

  hasOptions = (inputType) => {
    return inputType === 'select' || inputType === 'multiselect';
  }

  goBack = () => {
    browserHistory.push('/admin/settings/registration');
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

    if (this.hasOptions(customField.attributes.input_type)) {
      tabs.push({
        label: this.props.intl.formatMessage(messages.optionsTab),
        url: `${baseTabsUrl}/options`,
        className: 'options',
      });
    }

    return tabs;
  }

  render() {
    const { customField, children } = this.props;
    const childrenWithExtraProps = React.cloneElement(children as React.ReactElement<any>, { customField });

    return customField && (
      <>
        <StyledGoBackButton onClick={this.goBack} />
        <TabbedResource
          location={this.props.location}
          tabs={this.getTabs(customField)}
          resource={{
            title: customField.attributes.title_multiloc,
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

export default withRouter(injectIntl((inputProps: InputProps & WithRouterProps & InjectedIntlProps) => (
  <GetCustomField id={inputProps.params.customFieldId}>
    {customField => <Edit {...inputProps} customField={customField} />}
  </GetCustomField>
)));
