import React from 'react';
import styled from 'styled-components';
import { withRouter, WithRouterProps } from 'react-router';
import clHistory from 'utils/cl-router/history';
import { isNilOrError } from 'utils/helperUtils';

// components
import GoBackButton from 'components/UI/GoBackButton';
import TabbedResource from 'components/admin/TabbedResource';

// services
import {
  IUserCustomFieldData,
  isBuiltInField,
  IInputType,
} from 'services/userCustomFields';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from '../messages';

// hooks
import useUserCustomFieldOptions from 'hooks/useUserCustomFieldOptions';
import useUserCustomField from 'hooks/useUserCustomField';
import useLocalize from 'hooks/useLocalize';

const StyledGoBackButton = styled(GoBackButton)`
  display: flex;
  margin-bottom: 20px;
`;

interface Props {}

const Edit = ({
  intl: { formatMessage },
  params: { customFieldId },
  children,
}: Props & WithRouterProps & InjectedIntlProps) => {
  const localize = useLocalize();
  const userCustomField = useUserCustomField(customFieldId);
  const userCustomFieldOptions = useUserCustomFieldOptions(customFieldId);
  const hasOptions = (inputType: IInputType) => {
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

    if (!isNilOrError(userCustomFieldOptions)) {
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
    { customField: userCustomField }
  );

  if (!isNilOrError(userCustomField)) {
    return (
      <>
        <StyledGoBackButton onClick={goBack} />
        <TabbedResource
          tabs={getTabs(userCustomField)}
          resource={{
            title: localize(userCustomField.attributes.title_multiloc),
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

export default withRouter(injectIntl(Edit));
