import React, { memo } from 'react';
import { WrappedComponentProps } from 'react-intl';
import { Outlet as RouterOutlet } from 'react-router-dom';
import styled from 'styled-components';
import useLocalize from 'hooks/useLocalize';
// hooks
import useUserCustomField from 'hooks/useUserCustomField';
// services
import {
  IUserCustomFieldData,
  isBuiltInField,
  IUserCustomFieldInputType,
} from 'services/userCustomFields';
// i18n
import { injectIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';
import { withRouter, WithRouterProps } from 'utils/cl-router/withRouter';
import { isNilOrError } from 'utils/helperUtils';
// components
import GoBackButton from 'components/UI/GoBackButton';
import TabbedResource from 'components/admin/TabbedResource';
import messages from '../messages';

const StyledGoBackButton = styled(GoBackButton)`
  display: flex;
  margin-bottom: 20px;
`;

export interface Props {
  children?: React.ReactNode;
}

const RegistrationCustomFieldEdit = memo(
  ({
    intl: { formatMessage },
    params: { userCustomFieldId },
  }: Props & WithRouterProps & WrappedComponentProps) => {
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
          name: 'fieldSettings',
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
          name: 'options',
        });
      }

      return tabs;
    };

    if (!isNilOrError(userCustomField)) {
      return (
        <>
          <StyledGoBackButton onClick={goBack} />
          <TabbedResource
            tabs={getTabs(userCustomField)}
            resource={{
              title: localize(userCustomField.attributes.title_multiloc),
            }}
          >
            <RouterOutlet />
          </TabbedResource>
        </>
      );
    }

    return null;
  }
);

export default withRouter(injectIntl(RegistrationCustomFieldEdit));
