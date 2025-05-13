import React, { useState } from 'react';

import { Box, Icon, fontSizes } from '@citizenlab/cl2-component-library';
import { WrappedComponentProps } from 'react-intl';

import Button from 'components/UI/ButtonWithLink';

import { injectIntl } from 'utils/cl-intl';

import { RepresentativenessData } from '../../../../../hooks/parseReferenceData';
import { Props as FieldInfoProps } from '../FieldInfo';
import messages from '../messages';

import Table from './Table';
import TableModal from './TableModal';

interface Props extends FieldInfoProps {
  title: string;
  data: RepresentativenessData;
  projectFilter?: string;
  legendLabels: string[];
  xlsxEndpoint: string;
}

const TableWrapper = ({
  title,
  data,
  legendLabels,
  includedUsers,
  fieldIsRequired,
  projectFilter,
  xlsxEndpoint,
  intl: { formatMessage },
}: Props & WrappedComponentProps) => {
  const [modalOpen, setModalOpen] = useState(false);

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  const columns = [title, ...legendLabels];
  const slicedData = data.slice(0, 12);
  const showModalButton = data.length > 12;
  const numberOfHiddenItems = data.length - 12;

  return (
    <>
      <Box mx="40px" my="20px">
        <Table columns={columns} data={slicedData} />
      </Box>

      {showModalButton && (
        <Button
          buttonStyle="secondary-outlined"
          width="160px"
          ml="40px"
          mt="36px"
          mb="32px"
          fontSize={`${fontSizes.s}px`}
          data-testid="show-modal-button"
          onClick={openModal}
        >
          <Box display="flex" alignItems="center">
            {formatMessage(messages.openTableModalButtonText, {
              numberOfHiddenItems,
            })}
            <Icon name="open-in-new" width="15px" height="15px" ml="12px" />
          </Box>
        </Button>
      )}

      <TableModal
        open={modalOpen}
        title={title}
        columns={columns}
        data={data}
        includedUsers={includedUsers}
        fieldIsRequired={fieldIsRequired}
        projectFilter={projectFilter}
        xlsxEndpoint={xlsxEndpoint}
        onClose={closeModal}
      />
    </>
  );
};

export default injectIntl(TableWrapper);
