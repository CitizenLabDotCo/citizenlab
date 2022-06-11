import React from 'react';

// components
import Modal from 'components/UI/Modal';
import { Box, Title } from '@citizenlab/cl2-component-library';
import Table from './Table';
import FieldInfo, { Props as FieldInfoProps } from '../FieldInfo';
import ReportExportMenu from 'components/admin/ReportExportMenu';

// typings
import { RepresentativenessData } from '../../../hooks/useReferenceData';

interface Props extends FieldInfoProps {
  open: boolean;
  title: string;
  columns: string[];
  data: RepresentativenessData;
  projectFilter: string | undefined;
  xlsxEndpoint: string;
  onClose: () => void;
}

const TableModal = ({
  open,
  title,
  columns,
  data,
  includedUserPercentage,
  fieldIsRequired,
  projectFilter,
  xlsxEndpoint,
  onClose,
}: Props) => (
  <Modal
    opened={open}
    close={onClose}
    width="70%"
    header={
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mt="-7px"
      >
        <Title variant="h2" as="h3" mt="0px" mb="3px">
          {title}
        </Title>
        <Box display="flex" alignItems="center">
          <Box mt="0px" display="flex" alignItems="flex-start" mr="16px">
            <FieldInfo
              includedUserPercentage={includedUserPercentage}
              fieldIsRequired={fieldIsRequired}
            />
          </Box>
          <ReportExportMenu
            name={title}
            currentProjectFilter={projectFilter}
            xlsxEndpoint={xlsxEndpoint}
          />
        </Box>
      </Box>
    }
  >
    <Box mx="32px" mb="32px">
      <Table columns={columns} data={data} hideBorderTop />
    </Box>
  </Modal>
);

export default TableModal;
