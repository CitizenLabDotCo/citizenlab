import React, { useRef, useState } from 'react';

// hooks
import useVisitorReferrerTypes from '../../hooks/useVisitorReferrerTypes';

// components
import GraphCard from 'components/admin/GraphCard';
import EmptyPieChart from '../EmptyPieChart';
import Chart from './Chart';
import Table from './Table';
import { Text, Icon } from '@citizenlab/cl2-component-library';
import TableModal from './TableModal';

// styling
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

// i18n
import messages from './messages';
import { useIntl } from 'react-intl';

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

const TableViewButton = styled.button`
  all: unset;
  text-decoration: underline;
  cursor: pointer;

  &:hover {
    color: ${colors.black};
  }
`;

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

  if (isNilOrError(pieData)) {
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
        svgNode: graphRef,
        xlsxData: isNilOrError(xlsxData) ? undefined : xlsxData,
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
        <Chart pieData={pieData} innerRef={graphRef} />
      )}

      {currentView === 'table' && (
        <Table
          projectId={projectFilter}
          startAtMoment={startAtMoment}
          endAtMoment={endAtMoment}
        />
      )}

      <Text ml="20px" mt="40px" mb="0px" color="coolGrey600" fontSize="s">
        <Icon
          name="info-outline"
          fill={colors.coolGrey600}
          width="14px"
          height="14px"
          transform="translate(0,-1)"
          mr="4px"
        />
        {formatMessage(messages.viewReferrerList, {
          referrerListButton: (
            <TableViewButton onClick={openModal}>
              {formatMessage(messages.referrerListButton)}
            </TableViewButton>
          ),
        })}
      </Text>

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
