import React, { memo } from 'react';
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
  IUserCustomFieldInputType,
} from 'services/userCustomFields';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from '../messages';

// hooks
import useUserCustomField from 'hooks/useUserCustomField';
import useLocalize from 'hooks/useLocalize';

const StyledGoBackButton = styled(GoBackButton)`
  display: flex;
  margin-bottom: 20px;
`;

export interface Props {
  children: JSX.Element | null;
}

const RegistrationCustomFieldEdit = memo(
  ({
    intl: { formatMessage },
    params: { userCustomFieldId },
    children,
  }: Props & WithRouterProps & InjectedIntlProps) => {
    const localize = useLocalize();
    const userCustomField = useUserCustomField(userCustomFieldId);
    const hasOptions = (inputType: IUserCustomFieldInputType) => {
      return inputType === 'select' || inputType === 'multiselect';
    };

    const goBack = () => {
      clHistory.push('/admin/settings/registration');
    };

    const getTabs = (customField: IUserCustomFieldData) => {
      const baseTabsUrl = `/admin/settings/registration/custom-fields/${customField.id}`;

      const tabs = [
        {
          label: formatMessage(messages.fieldSettingsTab),
          url: `${baseTabsUrl}/field-settings`,
          className: 'field-settings',
        },
      ];

      if (
        hasOptions(customField.attributes.input_type) &&
        !isBuiltInField(customField)
      ) {
        tabs.push({
          label: formatMessage(messages.answerOptionsTab),
          url: `${baseTabsUrl}/options`,
          className: 'options',
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
  }
);

export default withRouter(injectIntl(RegistrationCustomFieldEdit));
