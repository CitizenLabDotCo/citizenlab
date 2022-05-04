import React from 'react';

// hooks
import useLocalize from 'hooks/useLocalize';

// components
import Modal from 'components/UI/Modal';
import { Box, Title } from '@citizenlab/cl2-component-library';
import Table from './Table';
import FieldInfo, { Props as FieldInfoProps } from '../FieldInfo';

// typings
import { Multiloc } from 'typings';
import { RepresentativenessData } from '..';

interface Props extends FieldInfoProps {
  open: boolean;
  titleMultiloc: Multiloc;
  columns: string[];
  data: RepresentativenessData;
  onClose: () => void;
}

const TableModal = ({
  open,
  titleMultiloc,
  columns,
  data,
  includedUserPercentage,
  fieldIsRequired,
  onClose,
}: Props) => {
  const localize = useLocalize();

  return (
    <Modal
      opened={open}
      close={onClose}
      width="70%"
      header={
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="flex-start"
        >
          <Title variant="h2" as="h3" mt="3px" mb="0px">
            {localize(titleMultiloc)}
          </Title>
          <Box mt="7px">
            <FieldInfo
              includedUserPercentage={includedUserPercentage}
              fieldIsRequired={fieldIsRequired}
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
};

export default TableModal;
