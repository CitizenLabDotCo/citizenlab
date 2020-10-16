import React from 'react';
import styled from 'styled-components';
import { withRouter, WithRouterProps } from 'react-router';
import clHistory from 'utils/cl-router/history';
import { isNilOrError } from 'utils/helperUtils';
import {
  IUserCustomFieldData,
  isBuiltInField,
} from 'services/userCustomFields';
import GetCustomField, {
  GetCustomFieldChildProps,
} from 'resources/GetCustomField';
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

const Edit = ({
  intl: { formatMessage },
  customField,
  children,
  localize,
}: Props & WithRouterProps & InjectedIntlProps & InjectedLocalized) => {
  const hasOptions = (inputType) => {
    return inputType === 'select' || inputType === 'multiselect';
  };

  const goBack = () => {
    clHistory.push('/admin/settings/registration');
  };

  const getTabs = (customField: IUserCustomFieldData) => {
    const baseTabsUrl = `/admin/settings/registration/custom_fields/${customField.id}`;

    const tabs = [
      {
        label: formatMessage(messages.generalTab),
        url: `${baseTabsUrl}/general`,
        className: 'general',
      },
    ];

    if (
      hasOptions(customField.attributes.input_type) &&
      !isBuiltInField(customField)
    ) {
      tabs.push({
        label: formatMessage(messages.optionsTab),
        url: `${baseTabsUrl}/options`,
        className: 'options',
      });
    }

    if (!isNilOrError(customFieldOptions)) {
      tabs.push({
        label: formatMessage(messages.optionsOrderTab),
        url: `${baseTabsUrl}/options-order`,
        className: 'options-order',
      });
    }

    return tabs;
  };

  const childrenWithExtraProps = React.cloneElement(
    children as React.ReactElement<any>,
    { customField }
  );

  if (!isNilOrError(customField)) {
    return (
      <>
        <StyledGoBackButton onClick={goBack} />
        <TabbedResource
          tabs={getTabs(customField)}
          resource={{
            title: localize(customField.attributes.title_multiloc),
            publicLink: '',
          }}
        >
          {childrenWithExtraProps}
        </TabbedResource>
      </>
    );
  }

  return null;
};

const EditWithHOCs = injectIntl(injectLocalize(Edit));

export default withRouter(
  (
    inputProps: InputProps &
      WithRouterProps &
      InjectedIntlProps &
      InjectedLocalized
  ) => (
    <GetCustomField id={inputProps.params.customFieldId}>
      {(customField) => (
        <EditWithHOCs {...inputProps} customField={customField} />
      )}
    </GetCustomField>
  )
);
