import React, { useState } from 'react';

// components
import { Box, Icon } from '@citizenlab/cl2-component-library';
import Table from './Table';
import Button from 'components/UI/Button';
import TableModal from './TableModal';

// styling
import { fontSizes } from 'utils/styleUtils';

// i18n
import messages from '../messages';
import { injectIntl } from 'react-intl';
import { WrappedComponentProps } from 'react-intl';

// typings
import { RepresentativenessData } from '../../../hooks/createRefDataSubscription';
import { Props as FieldInfoProps } from '../FieldInfo';

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
          buttonStyle="secondary"
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
            <Icon name="openModal" width="15px" height="15px" ml="12px" />
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
