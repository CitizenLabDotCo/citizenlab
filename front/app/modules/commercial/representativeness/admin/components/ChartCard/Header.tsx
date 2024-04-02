import React from 'react';

import {
  Box,
  Title,
  Text,
  // IconTooltip,
} from '@citizenlab/cl2-component-library';

// import RepresentativenessArticleLink from '../RepresentativenessArticleLink';
import ViewToggle, { View } from 'components/admin/GraphCard/ViewToggle';
import ReportExportMenu from 'components/admin/ReportExportMenu';

import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';

interface Props {
  title: string;
  svgNode: React.RefObject<SVGElement | undefined>;
  rScore: number;
  projectFilter?: string;
  xlsxEndpoint: string;
  view: View;
  onChangeView: (newView: View) => void;
}

const Header = ({
  title,
  svgNode,
  rScore,
  projectFilter,
  xlsxEndpoint,
  view,
  onChangeView,
}: Props) => (
  <Box
    p="20px 40px 0px 40px"
    mb="12px"
    display="flex"
    justifyContent="space-between"
  >
    <Title color="primary" variant="h3" as="h2">
      {title}
    </Title>
    <Box display="flex" alignItems="center" mt="4px">
      <Text
        fontSize="s"
        color="textSecondary"
        fontWeight="bold"
        display="inline"
        m="0px"
        mr="8px"
        mb="0px"
      >
        <FormattedMessage {...messages.representativenessScoreText} />
      </Text>

      <Text
        fontSize="xxl"
        display="inline"
        color="primary"
        fontWeight="bold"
        m="0px"
        mb="0px"
      >
        {Math.round(rScore * 100)}
      </Text>

      <Text
        fontSize="xxl"
        display="inline"
        color="grey500"
        m="0px"
        mr="8px"
        mb="0px"
      >
        /100
      </Text>
      {/* <IconTooltip
        content={
          <FormattedMessage
            {...messages.representativenessScoreTooltipText}
            values={{
              representativenessArticleLink: <RepresentativenessArticleLink />,
            }}
          />
        }
        mr="12px"
      /> */}
      <Box mr="12px">
        <ReportExportMenu
          name={title}
          currentProjectFilter={projectFilter}
          xlsx={view === 'table' ? { endpoint: xlsxEndpoint } : undefined}
          svgNode={view === 'chart' ? svgNode : undefined}
        />
      </Box>
      <ViewToggle view={view} onChangeView={onChangeView} />
    </Box>
  </Box>
);

export default Header;
