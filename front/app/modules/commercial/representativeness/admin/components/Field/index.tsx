import React from 'react';

// hooks
import useLocalize from 'hooks/useLocalize';

// components
import { Row } from 'components/admin/ResourceList';
import { Box, Toggle, Text } from '@citizenlab/cl2-component-library';

// typings
import { Multiloc } from 'typings';

interface Props {
  enabled: boolean;
  titleMultiloc: Multiloc;
  onToggleEnabled: (event: React.FormEvent) => void;
}

const Field = ({ enabled, titleMultiloc, onToggleEnabled }: Props) => {
  const localize = useLocalize();

  return (
    <Row>
      <Box display="flex" alignItems="center">
        <Toggle checked={enabled} onChange={onToggleEnabled} />
        <Text mb="0px">{localize(titleMultiloc)}</Text>
      </Box>
    </Row>
  );
};

export default Field;
