import React from 'react';

// hooks
import useUserCustomFields from 'api/user_custom_fields/useUserCustomFields';

// intl
import useLocalize from 'hooks/useLocalize';

// components
import BarChartByCategory from 'components/admin/Graphs/BarChartByCategory';
import PieChartByCategory from 'components/admin/Graphs/PieChartByCategory';
import AreaChart from './AreaChart';
import GenderChart from './GenderChart';
import AgeChart from './AgeChart';
import { Box } from '@citizenlab/cl2-component-library';

// typings
import { IUserCustomFieldInputType } from 'api/user_custom_fields/types';
import { usersByCustomFieldXlsxEndpoint } from 'api/users_by_custom_field/util';

interface Props {
  currentGroupFilter: string | undefined;
  currentGroupFilterLabel: string | undefined;
  startAt: string | null | undefined;
  endAt: string | null;
}

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

  const localize = useLocalize();

  if (!customFields) {
    return null;
  }

  return (
    <>
      {customFields.map((field, index) => {
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
            return null;
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
                graphTitleString={localize(field.attributes.title_multiloc)}
                graphUnit="users"
                customId={field.id}
                xlsxEndpoint={usersByCustomFieldXlsxEndpoint(field.id)}
                id={field.id}
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
                graphTitleString={localize(field.attributes.title_multiloc)}
                graphUnit="users"
                customId={field.id}
                xlsxEndpoint={usersByCustomFieldXlsxEndpoint(field.id)}
                id={field.id}
              />
            );
          }
        }

        return null;
      })}
    </>
  );
};

const INPUT_TYPES: IUserCustomFieldInputType[] = [
  'select',
  'multiselect',
  'checkbox',
  'number',
];

export default RegistrationFieldsToGraphs;
