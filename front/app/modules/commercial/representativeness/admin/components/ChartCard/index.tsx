import React, { useRef } from 'react';

// hooks
import { useTheme } from 'styled-components';

// components
import { Box } from '@citizenlab/cl2-component-library';
import Header from './Header';
import MultiBarChart from 'components/admin/Graphs/MultiBarChart';
import { DEFAULT_BAR_CHART_MARGIN } from 'components/admin/Graphs/constants';
import Footer from './Footer';
import { LabelList } from 'recharts';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from '../messages';

// typings
import { IUserCustomFieldData } from 'modules/commercial/user_custom_fields/services/userCustomFields';

// data
import { TEST_GENDER_DATA } from './data';

interface Props {
  customField: IUserCustomFieldData;
}

const formatPercentage = (percentage) => `${percentage}%`;

const ChartCard = ({
  customField,
  intl: { formatMessage },
}: Props & InjectedIntlProps) => {
  const { newBarFill, secondaryNewBarFill }: any = useTheme();
  const currentChartRef = useRef<SVGElement>();

  const barNames = [
    formatMessage(messages.platformUsers),
    formatMessage(messages.totalPopulation),
  ];

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
          name: barNames,
          fill: [newBarFill, secondaryNewBarFill],
        }}
        margin={DEFAULT_BAR_CHART_MARGIN}
        yaxis={{ tickFormatter: formatPercentage }}
        renderLabels={(props) => (
          <LabelList {...props} formatter={formatPercentage} />
        )}
      />
      <Footer fieldIsRequired={customField.attributes.required} />
    </Box>
  );
};

export default injectIntl(ChartCard);
