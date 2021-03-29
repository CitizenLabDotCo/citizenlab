// libraries
import React, { PureComponent } from 'react';
import { map } from 'lodash-es';

// resources
import { isNilOrError } from 'utils/helperUtils';

// services
import {
  usersByRegFieldStream,
  IUsersByRegistrationField,
  usersByRegFieldXlsxEndpoint,
} from 'modules/commercial/user_custom_fields/services/stats';

// intl
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import localize, { InjectedLocalized } from 'utils/localize';
import messages from 'containers/Admin/dashboard/messages';

// components
import BarChartByCategory from 'containers/Admin/dashboard/users/charts/BarChartByCategory';
import PieChartByCategory from 'containers/Admin/dashboard/users/charts/PieChartByCategory';

import AreaChart from 'modules/commercial/user_custom_fields/admin/components/AreaChart';
import GenderChart from 'modules/commercial/user_custom_fields/admin/components/GenderChart';
import AgeChart from 'modules/commercial/user_custom_fields/admin/components/AgeChart';

import GetUserCustomFields, {
  GetUserCustomFieldsChildProps,
} from '../../resources/GetUserCustomFields';

interface InputProps {
  currentGroupFilter: string | undefined;
  currentGroupFilterLabel: string | undefined;
  startAt: string | null | undefined;
  endAt: string | null;
}

interface DataProps {
  customFields: GetUserCustomFieldsChildProps;
}

export interface Props extends InputProps, DataProps {}

export class RegistrationFieldsToGraphs extends PureComponent<
  Props & InjectedIntlProps & InjectedLocalized
> {
  convertToGraphFormat = (data: IUsersByRegistrationField) => {
    const {
      series: { users },
      options,
    } = data;
    const res = map(options, (value, key) => {
      return {
        value: users[key] || 0,
        name: this.props.localize(value.title_multiloc),
        code: key,
      };
    });

    if (users['_blank']) {
      res.push({
        value: users['_blank'],
        name: this.props.intl.formatMessage(messages._blank),
        code: '_blank',
      });
    }

    return res.length > 0 ? res : null;
  };
  convertCheckboxToGraphFormat = (data: IUsersByRegistrationField) => {
    const {
      series: { users },
    } = data;
    const res = ['_blank', 'true', 'false'].map((key) => ({
      value: users[key] || 0,
      name: this.props.intl.formatMessage(messages[key]),
      code: 'key',
    }));

    return res.length > 0 ? res : null;
  };

  render() {
    const {
      customFields,
      localize,
      startAt,
      endAt,
      currentGroupFilter,
      currentGroupFilterLabel,
    } = this.props;

    if (isNilOrError(customFields)) {
      return null;
    }

    return customFields.map((field, index) => {
      if (field.attributes.enabled) {
        if (field.attributes.code === 'birthyear') {
          return (
            <AgeChart
              key={index}
              startAt={startAt}
              endAt={endAt}
              currentGroupFilter={currentGroupFilter}
              currentGroupFilterLabel={currentGroupFilterLabel}
            />
          );
        }
        if (field.attributes.input_type === 'number') {
          return;
        }
        if (field.attributes.code === 'gender') {
          return (
            <GenderChart
              key={index}
              startAt={startAt}
              endAt={endAt}
              currentGroupFilter={currentGroupFilter}
              currentGroupFilterLabel={currentGroupFilterLabel}
            />
          );
        }

        if (field.attributes.code === 'domicile') {
          return (
            <AreaChart
              key={index}
              startAt={startAt}
              endAt={endAt}
              currentGroupFilter={currentGroupFilter}
              currentGroupFilterLabel={currentGroupFilterLabel}
            />
          );
        }

        if (field.attributes.input_type === 'checkbox') {
          return (
            <PieChartByCategory
              key={index}
              startAt={startAt}
              endAt={endAt}
              currentGroupFilter={currentGroupFilter}
              currentGroupFilterLabel={currentGroupFilterLabel}
              convertToGraphFormat={this.convertCheckboxToGraphFormat}
              graphTitleString={localize(field.attributes.title_multiloc)}
              stream={usersByRegFieldStream}
              graphUnit="users"
              customId={field.id}
              xlsxEndpoint={usersByRegFieldXlsxEndpoint(field.id)}
            />
          );
        } else {
          return (
            <BarChartByCategory
              key={index}
              startAt={startAt}
              endAt={endAt}
              currentGroupFilter={currentGroupFilter}
              currentGroupFilterLabel={currentGroupFilterLabel}
              convertToGraphFormat={this.convertToGraphFormat}
              graphTitleString={localize(field.attributes.title_multiloc)}
              stream={usersByRegFieldStream}
              graphUnit="users"
              customId={field.id}
              xlsxEndpoint={usersByRegFieldXlsxEndpoint(field.id)}
            />
          );
        }
      }

      return null;
    });
  }
}

const RegistrationFieldsToGraphsWithHoCs = localize<Props>(
  injectIntl<Props & InjectedLocalized>(RegistrationFieldsToGraphs as any)
) as any;

export default (inputProps: InputProps) => (
  <GetUserCustomFields
    inputTypes={['select', 'multiselect', 'checkbox', 'number']}
  >
    {(customFields) => (
      <RegistrationFieldsToGraphsWithHoCs
        {...inputProps}
        customFields={customFields}
      />
    )}
  </GetUserCustomFields>
);
