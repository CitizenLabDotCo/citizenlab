import React from 'react';
import useAreas from 'api/areas/useAreas';
import useLocalize from 'hooks/useLocalize';
import { Box, Title, Text } from '@citizenlab/cl2-component-library';
import { useTheme } from 'styled-components';
import { transparentize } from 'polished';
import { IAreaData } from 'api/areas/types';

interface Props {
  areaIds: string[];
}

const Areas = ({ areaIds }: Props) => {
  const theme = useTheme();
  const localize = useLocalize();
  const { data: areas } = useAreas({});
  const filteredAreas =
    areas?.data.filter((area) => areaIds.includes(area.id)) || [];

  if (!areaIds || areaIds.length === 0) return null;

  return (
    <Box display="flex" flexDirection="column">
      <Title variant="h3">Areas</Title>
      <Box display="flex" flexWrap="wrap">
        {filteredAreas.map((area: IAreaData) => {
          return (
            <Box
              key={area.id}
              border={`1px solid ${transparentize(
                0.7,
                theme.colors.tenantSecondary
              )}}`}
              borderRadius={theme.borderRadius}
              p="6px 12px"
              mb="5px"
              mr="5px"
            >
              <Text color="tenantSecondary" my="0px" fontSize="s">
                {localize(area.attributes.title_multiloc)}
              </Text>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default Areas;
