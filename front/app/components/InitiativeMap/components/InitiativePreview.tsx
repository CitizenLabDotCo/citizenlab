import React from 'react';

import {
  Icon,
  Text,
  colors,
  Title,
  Box,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import useInitiativeById from 'api/initiatives/useInitiativeById';

import useLocalize from 'hooks/useLocalize';

import Body from 'components/PostShowComponents/Body';
import Button from 'components/UI/Button';

import { FormattedMessage } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';
import { updateSearchParams } from 'utils/cl-router/updateSearchParams';

import messages from '../messages';

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

const DescriptionPreview = styled.div`
  flex: 0 1 100%;
  overflow: hidden;
  position: relative;
  max-height: 80px;
  margin-bottom: 12px;
  margin-top: 4px;

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
      <Title styleVariant="h3" as="h1" m="0px">
        {initiativeTitle}
      </Title>
      {initiativeAddress && (
        <Box display="flex" pt="12px">
          <Icon pb="4px" fill={colors.coolGrey600} name="position" />
          <Text fontSize="s" color="coolGrey600" m="0px">
            {initiativeAddress}
          </Text>
        </Box>
      )}
      {initiativeId && (
        <DescriptionPreview>
          <Body
            postId={initiativeId}
            postType="initiative"
            body={localize(initiative.data.attributes.body_multiloc)}
            color={colors.coolGrey700}
          />
        </DescriptionPreview>
      )}
      <Button
        fullWidth={true}
        onClick={() => {
          updateSearchParams({ selected_initiative_id: initiative.data.id });
          clHistory.push(
            `/initiatives/${initiative.data.attributes.slug}?go_back=true`,
            { scrollToTop: true }
          );
        }}
      >
        <FormattedMessage {...messages.seeProposal} />
      </Button>
    </Container>
  );
};

export default InitiativePreview;
