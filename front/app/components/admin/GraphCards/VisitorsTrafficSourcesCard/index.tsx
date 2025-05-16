import React, { useRef, useState } from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import GraphCard from 'components/admin/GraphCard';
import { View } from 'components/admin/GraphCard/ViewToggle';

import { useIntl } from 'utils/cl-intl';

import EmptyPieChart from '../EmptyPieChart';
import { ProjectId, Dates } from '../typings';

import Chart from './Chart';
import messages from './messages';
import ReferrerListLink from './RefferListLink';
import Table from './Table';
import TableModal from './TableModal';
import useVisitorReferrerTypes from './useVisitorReferrerTypes';

type Props = ProjectId & Dates;

const VisitorsTrafficSourcesCard = ({
  projectId,
  startAtMoment,
  endAtMoment,
}: Props) => {
  const { formatMessage } = useIntl();
  const graphRef = useRef();
  const { pieData, tableData, xlsxData } = useVisitorReferrerTypes({
    projectId,
    startAtMoment,
    endAtMoment,
  });
  const [currentView, setCurrentView] = useState<View>('chart');
  const [modalOpen, setModalOpen] = useState(false);

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  const cardTitle = formatMessage(messages.visitorsTrafficSources);

  if (!pieData || !tableData || !xlsxData) {
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
          data: xlsxData,
        },
        startAt,
        endAt,
        currentProjectFilter: projectId,
      }}
      viewToggle={{
        view: currentView,
        onChangeView: setCurrentView,
      }}
    >
      {currentView === 'chart' && (
        <>
          <Box width="100%" height="initial" display="flex" alignItems="center">
            <Chart pieData={pieData} innerRef={graphRef} />
          </Box>
          <Box ml="20px" mt="40px">
            <ReferrerListLink onOpenModal={openModal} />
          </Box>
        </>
      )}

      {currentView === 'table' && (
        <Table tableData={tableData.slice(0, 10)} onOpenModal={openModal} />
      )}

      <TableModal tableData={tableData} open={modalOpen} onClose={closeModal} />
    </GraphCard>
  );
};

export default VisitorsTrafficSourcesCard;
