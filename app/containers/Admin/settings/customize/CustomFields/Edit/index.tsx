import * as React from 'react';
import styled from 'styled-components';
import { ICustomFieldData, customFieldForUsersStream } from 'services/userCustomFields';
import { injectResource, InjectedResourceLoaderProps } from 'utils/resourceLoaders/resourceLoader';
import GoBackButton from 'components/UI/GoBackButton';
import { browserHistory } from 'react-router';
import TabbedResource from 'components/admin/TabbedResource';
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from '../messages';


const StyledGoBackButton = styled(GoBackButton)`
  margin-bottom: 20px;
`;

type Props = {
  location: {
    pathname: string
  }
};

type State = {};

class Edit extends React.Component<Props & InjectedResourceLoaderProps<ICustomFieldData> & InjectedIntlProps, State> {

  hasOptions = (inputType) => {
    return inputType === 'select' || inputType === 'multi_select';
  }

  goBack = () => {
    browserHistory.push('/admin/custom_fields');
  }

  getTabs = (customField: ICustomFieldData) => {
    const baseTabsUrl = `/admin/custom_fields/${customField.id}`;

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
      <div>
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
      </div>
    );
  }
}

export default injectResource('customField', customFieldForUsersStream, (props) => (props.params.customFieldId))(injectIntl(Edit));
