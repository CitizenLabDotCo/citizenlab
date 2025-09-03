import React, { memo } from 'react';

import {
  Box,
  Icon,
  Text,
  colors,
  isRtl,
  useBreakpoint,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import useIdeaById from 'api/ideas/useIdeaById';

import {
  Header,
  Item,
} from 'containers/IdeasShow/components/MetaInformation/MetaInfoStyles';

import ButtonWithLink from 'components/UI/ButtonWithLink';

import { useIntl } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';
import { getAddressOrFallbackDMS } from 'utils/map';

import IdeaLocationMap from './IdeaLocationMap';
import messages from './messages';

const Container = styled.div`
  display: flex;
  align-items: center;

  ${isRtl`
    flex-direction: row-reverse;
  `}
`;

const StyledIcon = styled(Icon)`
  flex: 0 0 24px;
  fill: ${colors.textSecondary};
  margin-right: 8px;

  ${isRtl`
    margin-right: 0;
    margin-left: 8px;
  `}
`;
export interface Props {
  projectId: string;
  ideaId: string;
  compact?: boolean;
  className?: string;
}

const Location = memo<Props>(({ ideaId, compact, className }) => {
  const { formatMessage } = useIntl();
  const { data: idea } = useIdeaById(ideaId);
  const isTabletOrSmaller = useBreakpoint('tablet');

  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const point = idea?.data.attributes?.location_point_geojson;

  const address = !isNilOrError(idea)
    ? getAddressOrFallbackDMS(
        idea.data.attributes.location_description,
        idea.data.attributes.location_point_geojson
      )
    : null;

  if (address) {
    return (
      <Item className={className || ''} compact={compact}>
        <Header>{formatMessage(messages.location)}</Header>
        <Container>
          {point && (
            <Box display="block" width="100%">
              <Box display="flex">
                <StyledIcon name="position" ariaHidden />
                <ButtonWithLink
                  m="0px"
                  p="0px"
                  fontSize="m"
                  buttonStyle="text"
                  // TODO: Fix this the next time the file is edited.
                  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                  linkTo={`https://www.google.com/maps/search/?api=1&query=${point?.coordinates[1]},${point?.coordinates[0]}`}
                  openLinkInNewTab={isTabletOrSmaller ? false : true} // On tablet/mobile devices, this will open the app instead
                  pl="0px"
                  style={{
                    textDecoration: 'underline',
                    justifyContent: 'left',
                    textAlign: 'left',
                  }}
                >
                  <Text
                    mt="4px"
                    color="coolGrey600"
                    m="0px"
                    p="0px"
                    fontSize="s"
                  >
                    {address}
                  </Text>
                </ButtonWithLink>
              </Box>

              {!compact && (
                <Box width="100%" mt="8px" id="e2e-location-map">
                  <IdeaLocationMap
                    // TODO: Fix this the next time the file is edited.
                    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                    location={idea?.data.attributes?.location_point_geojson}
                  />
                </Box>
              )}
            </Box>
          )}

          {!point && (
            <Text
              m="0px"
              p="0px"
              id="e2e-address-text-only"
              color="coolGrey600"
              fontSize="s"
            >
              {address}
            </Text>
          )}
        </Container>
      </Item>
    );
  }

  return null;
});

export default Location;
