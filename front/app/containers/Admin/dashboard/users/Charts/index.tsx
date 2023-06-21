import React from 'react';

// services
import { usersByRegFieldStream } from 'services/userCustomFieldStats';

// hooks
import useUserCustomFields from 'api/user_custom_fields/useUserCustomFields';

// intl
import messages from 'containers/Admin/dashboard/messages';
import { useIntl } from 'utils/cl-intl';
import useLocalize from 'hooks/useLocalize';

// components
import BarChartByCategory from './BarChartByCategory';
import PieChartByCategory from './PieChartByCategory';
import AreaChart from './AreaChart';
import GenderChart from './GenderChart';
import AgeChart from './AgeChart';
import { Box } from '@citizenlab/cl2-component-library';

// utils
import { isNilOrError } from 'utils/helperUtils';

// typings
import { IUserCustomFieldInputType } from 'api/user_custom_fields/types';
import { IUsersByCustomField } from 'api/users_by_custom_field/types';
import { usersByCustomFieldXlsxEndpoint } from 'api/users_by_custom_field/util';

interface Props {
  currentGroupFilter: string | undefined;
  currentGroupFilterLabel: string | undefined;
  startAt: string | null | undefined;
  endAt: string | null;
}

type GraphOption = {
  value: number;
  name: string;
  code: string;
};

const RegistrationFieldsToGraphs = ({
  startAt,
  endAt,
  currentGroupFilter,
  currentGroupFilterLabel,
}: Props) => {
  const { data: userCustomFields } = useUserCustomFields({
    inputTypes: INPUT_TYPES,
  });

  const customFields = userCustomFields?.data;

  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const convertToGraphFormat = (data: IUsersByCustomField) => {
    const {
      series: { users },
      options,
    } = data.data.attributes;
    let res: GraphOption[] = [];
    if (options) {
      res = Object.entries(options)
        .sort((a, b) => a[1].ordering - b[1].ordering)
        .map(([key, value]) => ({
          value: users[key] || 0,
          name: localize(value.title_multiloc),
          code: key,
        }));
    }

    if (users['_blank']) {
      res.push({
        value: users['_blank'],
        name: formatMessage(messages._blank),
        code: '_blank',
      });
    }

    return res.length > 0 ? res : null;
  };
  const convertCheckboxToGraphFormat = (data: IUsersByCustomField) => {
    const {
      series: { users },
    } = data.data.attributes;
    const res = ['_blank', 'true', 'false'].map((key) => ({
      value: users[key] || 0,
      name: formatMessage(messages[key]),
      code: 'key',
    }));

    return res.length > 0 ? res : null;
  };

  if (isNilOrError(customFields)) {
    return null;
  }

  return customFields.map((field, index) => {
    if (field.attributes.enabled) {
      if (field.attributes.code === 'birthyear') {
        return (
          <Box width="50%" key={index}>
            <AgeChart
              startAt={startAt}
              endAt={endAt}
              currentGroupFilter={currentGroupFilter}
              currentGroupFilterLabel={currentGroupFilterLabel}
            />
          </Box>
        );
      }
      if (field.attributes.input_type === 'number') {
        return;
      }
      if (field.attributes.code === 'gender') {
        return (
          <Box width="50%" key={index}>
            <GenderChart
              startAt={startAt}
              endAt={endAt}
              currentGroupFilter={currentGroupFilter}
              currentGroupFilterLabel={currentGroupFilterLabel}
            />
          </Box>
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
            convertToGraphFormat={convertCheckboxToGraphFormat}
            graphTitleString={localize(field.attributes.title_multiloc)}
            stream={usersByRegFieldStream}
            graphUnit="users"
            customId={field.id}
            xlsxEndpoint={usersByCustomFieldXlsxEndpoint(field.id)}
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
            convertToGraphFormat={convertToGraphFormat}
            graphTitleString={localize(field.attributes.title_multiloc)}
            stream={usersByRegFieldStream}
            graphUnit="users"
            customId={field.id}
            xlsxEndpoint={usersByCustomFieldXlsxEndpoint(field.id)}
          />
        );
      }
    }

    return null;
  });
};

const INPUT_TYPES: IUserCustomFieldInputType[] = [
  'select',
  'multiselect',
  'checkbox',
  'number',
];

export default RegistrationFieldsToGraphs;
