import React, { useCallback } from 'react';
import styled from 'styled-components';

import { addVolunteer, deleteVolunteer } from 'services/volunteers';
import { ICauseData } from 'services/causes';

import LazyImage from 'components/LazyImage';
import Button from 'components/UI/Button';

import { FormattedMessage } from 'utils/cl-intl';
import T from 'components/T';
import messages from './messages';
import { isEmptyMultiloc } from 'utils/helperUtils';

const Container = styled.div``;

const Title = styled.h3``;

const Description = styled.div``;

const ImageWrapper = styled.div``;

const StyledLazyImage = styled(LazyImage)``;

const Meta = styled.div``;

const ActionWrapper = styled.div``;

interface InputProps {
  cause: ICauseData;
}

const CauseCard = ({ cause }: InputProps) => {

  const isVolunteer = !!cause.relationships?.user_volunteer?.data;

  const handleOnVolunteerClick = useCallback(() => {
    addVolunteer(cause.id);
  }, [cause]);

  const handleOnCancelClick = useCallback(() => {
    if (cause.relationships?.user_volunteer?.data) {
      deleteVolunteer(cause.id, cause.relationships.user_volunteer.data.id);
    }
  }, [cause]);

  return (
    <Container>
      <Title><T value={cause.attributes.title_multiloc} /></Title>
      {cause.attributes.image.medium &&
        <ImageWrapper>
          <StyledLazyImage src={cause.attributes.image.medium} alt="" />
        </ImageWrapper>
      }
      {!isEmptyMultiloc(cause.attributes.description_multiloc) &&
        <Description>
          <T value={cause.attributes.description_multiloc} supportHtml />
        </Description>
      }
      <Meta>
        <FormattedMessage {...messages.xVolunteers} values={{ x: cause.attributes.volunteers_count }}/>
      </Meta>
      <ActionWrapper>
        {!isVolunteer &&
          <Button
            onClick={handleOnVolunteerClick}
          >
            <FormattedMessage {...messages.volunteerButton} />
          </Button>
        }
        {isVolunteer &&
          <Button
            onClick={handleOnCancelClick}
            buttonStyle="text"
          >
            <FormattedMessage {...messages.cancelVolunteerButton} />
          </Button>
        }
      </ActionWrapper>
    </Container>
  );
};

export default CauseCard;
