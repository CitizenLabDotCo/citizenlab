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
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';

// typings
import { RepresentativenessData } from '..';
import { Props as FieldInfoProps } from '../FieldInfo';

interface Props extends FieldInfoProps {
  title: string;
  data: RepresentativenessData;
  svgNode: React.RefObject<SVGElement | undefined>;
  legendLabels: string[];
}

const TableWrapper = ({
  title,
  data,
  legendLabels,
  includedUserPercentage,
  fieldIsRequired,
  svgNode,
  intl: { formatMessage },
}: Props & InjectedIntlProps) => {
  const [modalOpen, setModalOpen] = useState(false);

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  const columns = [formatMessage(messages.item), ...legendLabels];
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
        includedUserPercentage={includedUserPercentage}
        fieldIsRequired={fieldIsRequired}
        svgNode={svgNode}
        onClose={closeModal}
      />
    </>
  );
};

export default injectIntl(TableWrapper);
