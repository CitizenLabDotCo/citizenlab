import React from 'react';

// services
import { IIdeaStatusData } from 'services/ideaStatuses';

// i18n
import T from 'components/T';

// style
import styled from 'styled-components';

// utils
import { fontSizes } from 'utils/styleUtils';

const Container = styled.div`
  color: #fff;
  font-size: ${fontSizes.xs}px;
  line-height: 16px;
  border-radius: ${(props: any) => props.theme.borderRadius};
  padding: 6px 12px;
  display: inline-block;
  text-transform: uppercase;
  text-align: center;
  font-weight: 600;
  background-color: ${(props: any) => props.color};
`;

interface Props {
  ideaStatus: IIdeaStatusData;
  className?: string;
}

const Status = ({ ideaStatus, className }: Props) => {
  const color = ideaStatus ? ideaStatus.attributes.color : '#bbb';

  return (
    <Container className={className} color={color}>
      <T value={ideaStatus.attributes.title_multiloc} />
    </Container>
  );
};

export default Status;
