import React, { memo } from 'react';

import { WrappedComponentProps } from 'react-intl';
import { Outlet as RouterOutlet } from 'react-router-dom';
import styled from 'styled-components';
import { ITab } from 'typings';

import {
  IUserCustomFieldData,
  IUserCustomFieldInputType,
} from 'api/user_custom_fields/types';
import useUserCustomField from 'api/user_custom_fields/useUserCustomField';
import { isBuiltInField } from 'api/user_custom_fields/util';

import useLocalize from 'hooks/useLocalize';

import TabbedResource from 'components/admin/TabbedResource';
import GoBackButton from 'components/UI/GoBackButton';

import { injectIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';
import { withRouter, WithRouterProps } from 'utils/cl-router/withRouter';

import messages from '../messages';

const StyledGoBackButton = styled(GoBackButton)`
  display: flex;
  margin-bottom: 20px;
`;

export interface Props {
  children?: React.ReactNode;
}

type TabType = ITab & { className: string };

const RegistrationCustomFieldEdit = memo(
  ({
    intl: { formatMessage },
    params: { userCustomFieldId },
  }: Props & WithRouterProps & WrappedComponentProps) => {
    const localize = useLocalize();
    const { data: userCustomField } = useUserCustomField(userCustomFieldId);
    const hasOptions = (inputType: IUserCustomFieldInputType) => {
      return inputType === 'select' || inputType === 'multiselect';
    };

    const goBack = () => {
      clHistory.push('/admin/settings/registration');
    };

    const getTabs = (customField: IUserCustomFieldData) => {
      const tabs: TabType[] = [
        {
          label: formatMessage(messages.fieldSettingsTab),
          url: `/admin/settings/registration/custom-fields/${customField.id}/field-settings`,
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
          url: `/admin/settings/registration/custom-fields/${customField.id}/options`,
          className: 'options',
          name: 'options',
        });
      }

      return tabs;
    };

    if (userCustomField) {
      return (
        <>
          <StyledGoBackButton onClick={goBack} />
          <TabbedResource
            tabs={getTabs(userCustomField.data)}
            resource={{
              title: localize(userCustomField.data.attributes.title_multiloc),
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
