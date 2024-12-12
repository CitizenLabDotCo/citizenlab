import React from 'react';

import { Box, colors, fontSizes } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { IAreas } from 'api/areas/types';

import useLocalize from 'hooks/useLocalize';

interface Props {
  areas: IAreas;
  onClickArea: (areaId: string) => void;
}

const ListItemText = styled.div`
  color: ${colors.textSecondary};
  font-size: ${fontSizes.base}px;
  font-weight: 400;
  line-height: 21px;
  text-align: left;
`;

const ListItem = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0px;
  margin-bottom: 4px;
  padding: 10px;
  background: #fff;
  border-radius: ${(props) => props.theme.borderRadius};
  cursor: pointer;

  &.last {
    margin-bottom: 0px;
  }

  &:hover,
  &.active {
    background: ${colors.grey300};
    ${ListItemText} {
      color: #000;
    }
  }
`;

const AreasList = ({ areas, onClickArea }: Props) => {
  const localize = useLocalize();

  return (
    <Box maxHeight="200px">
      {areas.data.map((area) => (
        <ListItem
          onClick={() => {
            onClickArea(area.id);
          }}
          key={area.id}
        >
          <ListItemText>
            {localize(area.attributes.title_multiloc)}
          </ListItemText>
        </ListItem>
      ))}
    </Box>
  );
};

export default AreasList;
