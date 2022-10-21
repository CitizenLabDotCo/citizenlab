import React from 'react';
import styled from 'styled-components';

// components
import { Box, Text, Title } from '@citizenlab/cl2-component-library';
// import RepresentativenessArticleLink from '../RepresentativenessArticleLink';
import ReportExportMenu from 'components/admin/ReportExportMenu';
import Tabs, { ITabItem } from 'components/UI/Tabs';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// typings
import { ViewState } from '.';

const StyledTabs = styled(Tabs)`
  button {
    padding: 10px;
  }
  svg {
    margin-left: 0px;
  }
`;

interface Props {
  title: string;
  svgNode: React.RefObject<SVGElement | undefined>;
  rScore: number;
  projectFilter?: string;
  xlsxEndpoint: string;
  viewState: ViewState;
  onChangeViewState: (newViewState: ViewState) => void;
}

const TAB_ITEMS: ITabItem[] = [
  { icon: 'chart-bar', name: 'chart', label: '' },
  { icon: 'list', name: 'table', label: '' },
];

const Header = ({
  title,
  svgNode,
  rScore,
  projectFilter,
  xlsxEndpoint,
  viewState,
  onChangeViewState,
}: Props) => (
  <Box
    p="20px 40px 0px 40px"
    mb="12px"
    display="flex"
    justifyContent="space-between"
  >
    <Title variant="h3" as="h2">
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
          xlsxEndpoint={viewState === 'table' ? xlsxEndpoint : undefined}
          svgNode={viewState === 'chart' ? svgNode : undefined}
        />
      </Box>
      <StyledTabs
        items={TAB_ITEMS}
        selectedValue={viewState}
        onClick={onChangeViewState}
      />
    </Box>
  </Box>
);

export default Header;
