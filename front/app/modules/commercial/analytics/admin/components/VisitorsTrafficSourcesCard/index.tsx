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

// typings
import { IResolution } from 'components/admin/ResolutionControl';
import { Moment } from 'moment';
import { isNilOrError } from 'utils/helperUtils';
import { View } from 'components/admin/GraphCard/ViewToggle';

interface Props {
  startAtMoment: Moment | null | undefined;
  endAtMoment: Moment | null;
  projectFilter: string | undefined;
  resolution: IResolution;
}

const VisitorsTrafficSourcesCard = ({
  startAtMoment,
  endAtMoment,
  projectFilter,
  resolution,
}: Props) => {
  const { formatMessage } = useIntl();
  const graphRef = useRef();
  const { pieData, xlsxData } = useVisitorReferrerTypes({
    startAtMoment,
    endAtMoment,
    projectId: projectFilter,
  });
  const [currentView, setCurrentView] = useState<View>('chart');
  const [modalOpen, setModalOpen] = useState(false);

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  const cardTitle = formatMessage(messages.visitorsTrafficSources);

  if (isNilOrError(pieData) || isNilOrError(xlsxData)) {
    return (
      <GraphCard title={cardTitle}>
        <EmptyPieChart />
      </GraphCard>
    );
  }

  const startAt = startAtMoment?.toISOString();
  const endAt = endAtMoment?.toISOString();

  return (
    <GraphCard
      title={cardTitle}
      exportMenu={{
        name: cardTitle,
        svgNode: currentView === 'chart' ? graphRef : undefined,
        xlsx: {
          onDownload: () =>
            getXlsxData(
              {
                projectId: projectFilter,
                startAtMoment,
                endAtMoment,
              },
              xlsxData,
              formatMessage
            ),
        },
        startAt,
        endAt,
        currentProjectFilter: projectFilter,
        resolution,
      }}
      viewToggle={{
        view: currentView,
        onChangeView: setCurrentView,
      }}
    >
      {currentView === 'chart' && (
        <Chart pieData={pieData} innerRef={graphRef} onOpenModal={openModal} />
      )}

      {currentView === 'table' && (
        <Table
          projectId={projectFilter}
          startAtMoment={startAtMoment}
          endAtMoment={endAtMoment}
          onOpenModal={openModal}
        />
      )}

      <TableModal
        projectId={projectFilter}
        startAtMoment={startAtMoment}
        endAtMoment={endAtMoment}
        open={modalOpen}
        onClose={closeModal}
      />
    </GraphCard>
  );
};

export default VisitorsTrafficSourcesCard;
