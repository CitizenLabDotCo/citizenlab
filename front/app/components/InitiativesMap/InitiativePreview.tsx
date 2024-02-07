import React from 'react';

// components
import Button from 'components/UI/Button';
import {
  Icon,
  Text,
  colors,
  Title,
  Box,
} from '@citizenlab/cl2-component-library';
import Body from 'components/PostShowComponents/Body';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// style
import styled from 'styled-components';

// hooks
import useInitiativeById from 'api/initiatives/useInitiativeById';
import useLocalize from 'hooks/useLocalize';

const Container = styled.div`
  flex: 1;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding: 30px;
  position: relative;
  overflow: hidden;
`;

const MapMarkerIcon = styled(Icon)`
  flex: 0 0 24px;
  fill: ${colors.textSecondary};
  margin-right: 5px;
  margin-top: -2px;
`;

const Description = styled.div`
  flex: 0 1 100%;
  margin-bottom: 1rem;
  overflow: hidden;
  position: relative;
  max-height: 80px;

  &::after {
    background: linear-gradient(0deg, white, rgba(255, 255, 255, 0));
    bottom: 0;
    content: '';
    display: block;
    height: 3rem;
    left: 0;
    right: 0;
    position: absolute;
  }
`;

interface Props {
  initiativeId: string | null;
  className?: string;
}

const StyledBody = styled(Body)`
  margin-bottom: 12px;
  margin-top: 4px;
`;

const InitiativePreview = ({ className, initiativeId }: Props) => {
  const localize = useLocalize();
  const { data: initiative } = useInitiativeById(initiativeId || undefined);

  if (!initiative) {
    return null;
  }

  const initiativeAddress = initiative.data.attributes.location_description;
  const initiativeTitle = localize(initiative.data.attributes.title_multiloc);

  return (
    <Container className={className}>
      <Title
        variant="h3"
        as="h1"
        m="0px"
        style={{ textOverflow: 'ellipsis', overflow: 'hidden' }}
      >
        {initiativeTitle}
      </Title>
      {initiativeAddress && (
        <Box display="flex" pt="12px">
          <MapMarkerIcon name="position" />
          <Text fontSize="s" color="coolGrey600" m="0px">
            {initiativeAddress}
          </Text>
        </Box>
      )}
      {initiativeId && (
        <Description>
          <StyledBody
            postId={initiativeId}
            postType="initiative"
            body={localize(initiative.data.attributes.body_multiloc)}
            color={colors.coolGrey700}
          />
        </Description>
      )}
      <Button
        fullWidth={true}
        linkTo={`/initiatives/${initiative.data.attributes.slug}?go_back=true`}
        scrollToTop
      >
        <FormattedMessage {...messages.seeInitiative} />
      </Button>
    </Container>
  );
};

export default InitiativePreview;
