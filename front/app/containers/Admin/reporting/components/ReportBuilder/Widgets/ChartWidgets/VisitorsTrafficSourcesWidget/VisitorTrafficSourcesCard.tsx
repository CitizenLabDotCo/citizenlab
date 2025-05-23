import React, { useState } from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import useLayout from 'containers/Admin/reporting/hooks/useLayout';

import { ProjectId, DatesStrings } from 'components/admin/GraphCards/typings';
import ReferrerListLink from 'components/admin/GraphCards/VisitorsTrafficSourcesCard/RefferListLink';
import TableModal from 'components/admin/GraphCards/VisitorsTrafficSourcesCard/TableModal';

import NoData from '../../_shared/NoData';
import messages from '../messages';

import Chart from './Chart';
import Table from './Table';
import useVisitorReferrerTypes from './useVisitorReferrerTypes';
import { View } from './typings';

type Props = ProjectId &
  DatesStrings & {
    view?: View;
  };

const VisitorsTrafficSourcesCard = ({
  projectId,
  startAt,
  endAt,
  view = 'chart',
}: Props) => {
  const { pieData, tableData } = useVisitorReferrerTypes({
    projectId,
    startAt,
    endAt,
  });
  const layout = useLayout();
  const [modalOpen, setModalOpen] = useState(false);

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  if (!pieData || !tableData) {
    return <NoData message={messages.noData} />;
  }

  return (
    <Box>
      <Box
        width="100%"
        height={view === 'chart' ? '220px' : undefined}
        mt="20px"
        pb="10px"
      >
        {view === 'chart' ? (
          <Chart pieData={pieData} layout={layout} />
        ) : (
          <>
            <Table tableData={tableData} />
            <Box mt="12px">
              <ReferrerListLink onOpenModal={openModal} />
            </Box>
          </>
        )}
      </Box>
      <TableModal tableData={tableData} open={modalOpen} onClose={closeModal} />
    </Box>
  );
};

export default VisitorsTrafficSourcesCard;
