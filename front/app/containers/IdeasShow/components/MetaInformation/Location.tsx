import React, { memo } from 'react';
import styled from 'styled-components';
import useIdeaById from 'api/ideas/useIdeaById';
import { isNilOrError } from 'utils/helperUtils';

// components
import { Icon, Text, colors, isRtl } from '@citizenlab/cl2-component-library';
import {
  Header,
  Item,
} from 'containers/IdeasShow/components/MetaInformation/MetaInfoStyles';

// utils
import { getAddressOrFallbackDMS } from 'utils/map';

// i18n
import { useIntl } from 'utils/cl-intl';
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

  const point =
    (!isNilOrError(idea) && idea.data.attributes?.location_point_geojson) ||
    null;
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
          <StyledIcon name="position" ariaHidden />
          {address}
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
