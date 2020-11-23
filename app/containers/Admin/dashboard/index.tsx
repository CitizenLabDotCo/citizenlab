import React, { memo } from 'react';
import { adopt } from 'react-adopt';

// components
import HelmetIntl from 'components/HelmetIntl';
import DashboardTabs from './components/DashboardTabs';

// resource
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';

// permissions
import { isAdmin, isProjectModerator } from 'services/permissions/roles';

// i18n
import messages from './messages';
import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';

// styling
import styled from 'styled-components';
import { media, colors, fontSizes } from 'utils/styleUtils';
import { rgba } from 'polished';

export const ControlBar = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 30px;
  width: 100%;
`;

export const GraphsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  margin: 20px -10px;
  background: inherit;
  @media print {
    flex-direction: column;
    position: relative;
    align-items: center;
  }
`;

export const Column = styled.div`
  width: 50%;
  display: flex;
  align-items: flex-start;
  flex-direction: column;
  &.first {
    margin-right: 20px;
  }
  @media print {
    position: relative;
    width: 100%;
  }
`;

export const NoDataContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 150px;
  font-size: ${fontSizes.base}px;
  /*
   * Needed to vertically center the text
   * Reason being: we have a margin-bottom on the header,
   * Which we want to keep when there's an actual graph
   */
  padding: 20px;
`;

export const GraphCardInner = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding-top: 20px;
  padding-left: 20px;
  padding-right: 20px;
  padding-bottom: 35px;
  border: solid 1px #ccc;
  border-radius: ${(props: any) => props.theme.borderRadius};
  background: ${colors.adminContentBackground};
  p {
    font-size: ${fontSizes.base}px;
    flex-grow: 1;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  @media print {
    position: relative;
    display: block;
    page-break-inside: avoid;
    width: 100%;
    padding: 0 10px;
    border: none;
  }
`;

export const GraphCard = styled.div`
  padding: 10px;
  height: 350px;
  display: flex;
  width: 50%;

  &.dynamicHeight {
    height: auto;

    ${GraphCardInner} {
      position: relative;
    }
  }

  &.fullWidth {
    width: 100%;
  }
  @media print {
    position: relative;
    display: block;
    page-break-before: always;
    page-break-inside: avoid;
    height: 400px;
  }
  @media print and (orientation: portrait) {
    width: 100%;
  }
  @media print and (orientation: landscape) {
    width: 50%;
  }
`;

export const GraphCardHeader = styled.div`
  display: flex;
  min-height: 64px;
  align-items: center;
  justify-content: space-between;
  font-size: ${fontSizes.xl}px;
  font-weight: 400;
  margin-bottom: 20px;
  padding: 20px;
  @media print {
    display: block;
    justify-content: flex-start;
    page-break-after: avoid;
    page-break-before: always;
    page-break-inside: avoid;
    h3 {
      margin-right: 20px;
    }
  }
`;

export const PieChartStyleFixesDiv = styled.div`
  overflow: hidden;
  .recharts-surface,
  .recharts-wrapper,
  .recharts-responsive-container {
    height: 195px !important;
    min-width: 190px;
    overflow: visible;
  }
`;

export const GraphCardHeaderWithFilter = styled(GraphCardHeader)`
  align-items: center;

  ${media.smallerThan1280px`
    flex-direction: column;
    align-items: flex-start;
    margin-top: 0px;
  `}
`;

export const GraphCardTitle = styled.h3`
  display: flex;
  align-items: center;
  margin: 0;
`;

export const GraphCardFigureContainer = styled.div`
  margin-left: 10px;
  display: flex;
  align-items: center;
`;

export const GraphCardFigure = styled.span`
  margin-right: 5px;
  font-weight: 600;
`;

export const GraphCardFigureChange = styled.span`
  font-size: ${fontSizes.base}px;

  &.increase {
    color: ${colors.clGreenSuccess};
  }

  &.decrease {
    color: ${colors.clRedError};
  }
`;

export type IGraphUnit = 'users' | 'ideas' | 'comments' | 'votes';

export type IResolution = 'day' | 'week' | 'month';

interface Props {
  authUser: GetAuthUserChildProps;
  children: JSX.Element;
}

export const chartTheme = (theme) => {
  return {
    ...theme,
    chartStroke: colors.clIconAccent,
    chartStrokeGreen: colors.clGreen,
    chartStrokeRed: colors.clRed,
    chartFill: colors.clIconAccent,
    barFill: colors.adminContentBackground,
    chartLabelColor: colors.adminSecondaryTextColor,
    barHoverColor: rgba(colors.clIconAccent, 0.25),
    chartLabelSize: 13,
    animationBegin: 10,
    animationDuration: 200,
    cartesianGridColor: '#f5f5f5',
    newBarFill: '#073F80',
    newLineColor: '#7FBBCA',
  };
};

export const DashboardsPage = memo(
  ({
    authUser,
    children,
    intl: { formatMessage },
  }: Props & InjectedIntlProps) => {
    const tabs = [
      { label: formatMessage(messages.tabSummary), url: '/admin/dashboard' },
      {
        label: formatMessage(messages.tabUsers),
        url: '/admin/dashboard/users',
      },
      {
        label: formatMessage(messages.tabReports),
        url: '/admin/dashboard/reports',
        feature: 'project_reports',
      },
      {
        label: formatMessage(messages.tabInsights),
        url: '/admin/dashboard/insights',
        feature: 'clustering',
      },
      {
        label: formatMessage(messages.tabMap),
        url: '/admin/dashboard/map',
        feature: 'geographic_dashboard',
      },
    ];
    const moderatorTabs = [
      { label: formatMessage(messages.tabSummary), url: '/admin/dashboard' },
      {
        label: formatMessage(messages.tabReports),
        url: '/admin/dashboard/reports',
        feature: 'project_reports',
      },
    ];

    const resource = {
      title: formatMessage(messages.titleDashboard),
      subtitle: formatMessage(messages.subtitleDashboard),
    };

    if (authUser) {
      if (isAdmin({ data: authUser })) {
        return (
          <DashboardTabs resource={resource} tabs={tabs}>
            <HelmetIntl
              title={messages.helmetTitle}
              description={messages.helmetDescription}
            />
            {children}
          </DashboardTabs>
        );
      } else if (isProjectModerator({ data: authUser })) {
        return (
          <DashboardTabs resource={resource} tabs={moderatorTabs}>
            <HelmetIntl
              title={messages.helmetTitle}
              description={messages.helmetDescription}
            />
            {children}
          </DashboardTabs>
        );
      }
    }

    return null;
  }
);

const DashboardsPageWithHoC = injectIntl(DashboardsPage);

const Data = adopt({
  authUser: <GetAuthUser />,
});

export default (props) => (
  <Data {...props}>
    {(dataProps) => <DashboardsPageWithHoC {...dataProps} {...props} />}
  </Data>
);
