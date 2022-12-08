import React, { useRef, useState } from 'react';

// hooks
import useVisitorReferrerTypes from '../../hooks/useVisitorReferrerTypes';

// components
import GraphCard from 'components/admin/GraphCard';
import EmptyPieChart from '../EmptyPieChart';
import Chart from './Chart';
import Table from './Table';
import TableModal from './TableModal';

// i18n
import messages from './messages';
import { useIntl } from 'utils/cl-intl';

// utils
import getXlsxData from './getXlsxData';
import { isNilOrError } from 'utils/helperUtils';

// typings
import { ProjectId, Dates, ChartDisplay } from '../../typings';
import { View } from 'components/admin/GraphCard/ViewToggle';

type Props = ProjectId & Dates & ChartDisplay;

const VisitorsTrafficSourcesCard = ({
  projectId,
  startAtMoment,
  endAtMoment,
  title,
  interactive = true,
}: Props) => {
  const { formatMessage } = useIntl();
  const graphRef = useRef();
  const { pieData, xlsxData } = useVisitorReferrerTypes({
    projectId,
    startAtMoment,
    endAtMoment,
  });
  const [currentView, setCurrentView] = useState<View>('chart');
  const [modalOpen, setModalOpen] = useState(false);

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  const cardTitle = title
    ? title
    : formatMessage(messages.visitorsTrafficSources);

  if (isNilOrError(pieData) || isNilOrError(xlsxData)) {
    return (
      <GraphCard title={cardTitle}>
        <EmptyPieChart />
      </GraphCard>
    );
  }

  const startAt = startAtMoment?.toISOString();
  const endAt = endAtMoment?.toISOString();

  const exportMenu = interactive
    ? {
        name: cardTitle,
        svgNode: currentView === 'chart' ? graphRef : undefined,
        xlsx: {
          onDownload: () =>
            getXlsxData(
              {
                projectId,
                startAtMoment,
                endAtMoment,
              },
              xlsxData,
              formatMessage
            ),
        },
        startAt,
        endAt,
        currentProjectFilter: projectId,
      }
    : undefined;

  const viewToggle = interactive
    ? { view: currentView, onChangeView: setCurrentView }
    : undefined;

  return (
    <GraphCard
      title={cardTitle}
      exportMenu={exportMenu}
      viewToggle={viewToggle}
    >
      {currentView === 'chart' && (
        <Chart
          pieData={pieData}
          innerRef={graphRef}
          onOpenModal={openModal}
          showReferrers={interactive}
        />
      )}

      {currentView === 'table' && (
        <Table
          projectId={projectId}
          startAtMoment={startAtMoment}
          endAtMoment={endAtMoment}
          onOpenModal={openModal}
        />
      )}

      <TableModal
        projectId={projectId}
        startAtMoment={startAtMoment}
        endAtMoment={endAtMoment}
        open={modalOpen}
        onClose={closeModal}
      />
    </GraphCard>
  );
};

export default VisitorsTrafficSourcesCard;
