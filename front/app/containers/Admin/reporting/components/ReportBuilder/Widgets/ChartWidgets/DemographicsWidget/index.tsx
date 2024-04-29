import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';

import { useDemographics } from 'api/graph_data_units';
import useUserCustomField from 'api/user_custom_fields/useUserCustomField';

import useLocalize from 'hooks/useLocalize';

import Card from '../../_shared/Card';

import Chart from './Chart';
import messages from './messages';
import Settings from './Settings';
import { Props, Data } from './typings';

const FAKE_DATA: Data = [
  {
    northeast_quarter: 25,
    northwest_quarter: 17,
    city_center: 32,
    southeast_quarter: 24,
    other: 2,
  },
];

const DemographicsWidget = ({
  title,
  projectId,
  startAt,
  endAt,
  customFieldId,
}: Props) => {
  const localize = useLocalize();

  // TODO add real data
  const data = FAKE_DATA;

  const { data: hookData } = useDemographics({
    custom_field_id: customFieldId,
    project_id: projectId,
    start_at: startAt,
    end_at: endAt,
  });

  const { data: customField } = useUserCustomField(customFieldId);

  console.log({ hookData, customField });

  return (
    <Card pagebreak>
      <Box width="100%" pb="0px" display="flex">
        <Box w="300px" display="flex" flexDirection="column">
          <Text mt="1px" fontWeight="bold" fontSize="m" pr="16px">
            {localize(title)}
          </Text>
        </Box>
        <Chart data={data} />
      </Box>
    </Card>
  );
};

DemographicsWidget.craft = {
  props: {
    title: undefined,
    projectId: undefined,
    startAt: undefined,
    endAt: null,
    customFieldId: undefined,
  },
  related: {
    settings: Settings,
  },
};

export const demographicsTitle = messages.demographics;

export default DemographicsWidget;
