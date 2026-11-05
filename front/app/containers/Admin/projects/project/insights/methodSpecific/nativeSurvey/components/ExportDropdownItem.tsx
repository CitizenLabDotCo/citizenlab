import React from 'react';

import {
  Box,
  Text,
  Icon,
  DropdownListItem,
  colors,
} from '@citizenlab/cl2-component-library';

type Props = {
  label: string;
  onClick: () => void;
  // Optional trailing node, e.g. a "beta" badge.
  badge?: React.ReactNode;
  'data-cy'?: string;
};

const ExportDropdownItem = ({ label, onClick, badge, ...rest }: Props) => (
  <DropdownListItem onClick={onClick} data-cy={rest['data-cy']}>
    <Icon name="download" fill={colors.coolGrey600} mr="8px" />
    {badge ? (
      <Box display="flex" alignItems="center" gap="6px">
        <Text my="0px">{label}</Text>
        {badge}
      </Box>
    ) : (
      <Text my="0px">{label}</Text>
    )}
  </DropdownListItem>
);

export default ExportDropdownItem;
