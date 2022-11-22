import React, { PureComponent } from 'react';

// services
import {
  usersByRegFieldStream,
  IUsersByRegistrationField,
  usersByRegFieldXlsxEndpoint,
} from 'services/userCustomFieldStats';

// hooks
import useUserCustomFields from 'components/UserCustomFields/hooks/useUserCustomFields';

// intl
import { injectIntl } from 'utils/cl-intl';
import { WrappedComponentProps } from 'react-intl';
import localize, { InjectedLocalized } from 'utils/localize';
import messages from 'containers/Admin/dashboard/messages';

// components
import BarChartByCategory from './BarChartByCategory';
import PieChartByCategory from './PieChartByCategory';
import AreaChart from './AreaChart';
import GenderChart from './GenderChart';
import AgeChart from './AgeChart';

// utils
import { isNilOrError, NilOrError } from 'utils/helperUtils';

// typings
import {
  IUserCustomFieldInputType,
  IUserCustomFieldData,
} from 'services/userCustomFields';

interface InputProps {
  currentGroupFilter: string | undefined;
  currentGroupFilterLabel: string | undefined;
  startAt: string | null | undefined;
  endAt: string | null;
}

interface DataProps {
  customFields: IUserCustomFieldData[] | NilOrError;
}

type GraphOption = {
  value: number;
  name: string;
  code: string;
};

export interface Props extends InputProps, DataProps {}

export class RegistrationFieldsToGraphs extends PureComponent<
  Props & WrappedComponentProps & InjectedLocalized
> {
  convertToGraphFormat = (data: IUsersByRegistrationField) => {
    const {
      series: { users },
      options,
    } = data;
    let res: GraphOption[] = [];
    if (options) {
      res = Object.entries(options)
        .sort((a, b) => a[1].ordering - b[1].ordering)
        .map(([key, value]) => ({
          value: users[key] || 0,
          name: this.props.localize(value.title_multiloc),
          code: key,
        }));
    }

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
  injectIntl(RegistrationFieldsToGraphs as any)
) as any;

const INPUT_TYPES: IUserCustomFieldInputType[] = [
  'select',
  'multiselect',
  'checkbox',
  'number',
];

export default (inputProps: InputProps) => {
  const userCustomFields = useUserCustomFields({
    inputTypes: INPUT_TYPES,
  });

  return (
    <RegistrationFieldsToGraphsWithHoCs
      {...inputProps}
      customFields={userCustomFields}
    />
  );
};
