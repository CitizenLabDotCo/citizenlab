import React from 'react';
import styled from 'styled-components';
// components
import {
  IconTooltip,
  Toggle,
  Box,
  Title,
} from '@citizenlab/cl2-component-library';
import { Row } from 'components/admin/ResourceList';
import AdminEditButton from './AdminEditButton';

const StyledToggle = styled(Toggle)`
  margin-right: 20px;
`;

interface Props {
  onChangeSectionToggle: () => void;
  onClickEditButton: () => void;
}

const HomepageSectionToggle = ({
  onChangeSectionToggle,
  onClickEditButton,
}: Props) => {
  return (
    <Row>
      <Box display="flex" alignItems="center">
        <StyledToggle checked onChange={onChangeSectionToggle} />
        {/*
      Note: I think we want a default font-weigt of 600, not 700 for this component.
      Also, the margin-top is more than margin-bottom (for an h3).
      */}
        <Title variant="h3" mr="10px">
          Hero banner
        </Title>
        <IconTooltip content="" />
      </Box>
      <AdminEditButton onClick={onClickEditButton} />
    </Row>
  );
};

export default HomepageSectionToggle;
