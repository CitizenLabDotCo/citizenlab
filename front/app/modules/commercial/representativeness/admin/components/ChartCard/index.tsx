import React, { useRef } from 'react';

// hooks
import { useTheme } from 'styled-components';

// components
import { Box } from '@citizenlab/cl2-component-library';
import Header from './Header';
import MultiBarChart from 'components/admin/Graphs/MultiBarChart';
import { DEFAULT_BAR_CHART_MARGIN } from 'components/admin/Graphs/constants';

// typings
import { IUserCustomFieldData } from 'modules/commercial/user_custom_fields/services/userCustomFields';

// data
import { TEST_GENDER_DATA } from './data';

interface Props {
  customField: IUserCustomFieldData;
}

const ChartCard = ({ customField }: Props) => {
  const { newBarFill, secondaryNewBarFill }: any = useTheme();
  const currentChartRef = useRef<SVGElement>();

  return (
    <Box width="100%" background="white">
      <Header
        titleMultiloc={customField.attributes.title_multiloc}
        svgNode={currentChartRef}
      />
      <MultiBarChart
        height={300}
        innerRef={currentChartRef}
        data={TEST_GENDER_DATA}
        mapping={{ length: ['actualValue', 'referenceValue'] }}
        bars={{
          name: ['Platform users', 'Total population'],
          fill: [newBarFill, secondaryNewBarFill],
        }}
        margin={DEFAULT_BAR_CHART_MARGIN}
      />
    </Box>
  );
};

export default ChartCard;
