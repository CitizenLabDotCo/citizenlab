import React from 'react';

// hooks
import useLocalize from 'hooks/useLocalize';

// components
import Modal from 'components/UI/Modal';
import { Box, Title } from '@citizenlab/cl2-component-library';
import Table from './Table';
import FieldInfo, { Props as FieldInfoProps } from '../FieldInfo';
import ReportExportMenu from 'components/admin/ReportExportMenu';

// typings
import { Multiloc } from 'typings';
import { RepresentativenessData } from '..';

interface Props extends FieldInfoProps {
  open: boolean;
  titleMultiloc: Multiloc;
  columns: string[];
  data: RepresentativenessData;
  svgNode: React.RefObject<SVGElement | undefined>;
  onClose: () => void;
}

const TableModal = ({
  open,
  titleMultiloc,
  columns,
  data,
  includedUserPercentage,
  fieldIsRequired,
  svgNode,
  onClose,
}: Props) => {
  const localize = useLocalize();
  const title = localize(titleMultiloc);

  return (
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
            <ReportExportMenu name={title} svgNode={svgNode} />
          </Box>
        </Box>
      }
    >
      <Box mx="32px" mb="32px">
        <Table columns={columns} data={data} hideBorderTop />
      </Box>
    </Modal>
  );
};

export default TableModal;
