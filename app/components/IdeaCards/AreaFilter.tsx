import React, { memo } from 'react';
import { adopt } from 'react-adopt';
import { capitalize } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// styling
import { fontSizes, colors } from 'utils/styleUtils';

// components
import T from 'components/T';

// resources
import GetAreas, { GetAreasChildProps } from 'resources/GetAreas';
import GetIdeaStatuses, { GetIdeaStatusesChildProps } from 'resources/GetIdeaStatuses';

// styling
import styled from 'styled-components';

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding-top: 25px;
  padding-bottom: 20px;
  padding-left: 20px;
  padding-right: 20px;
  background: #fff;
  border: 1px solid #ececec;
  border-radius: ${(props: any) => props.theme.borderRadius};
  box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.04);
`;

const Title = styled.div`
  color: ${({ theme }) => theme.colorText};
  font-size: ${fontSizes.small}px;
  font-weight: 600;
  text-transform: uppercase;
  margin-bottom: 15px;
  margin-left: 18px;
`;

const Count = styled.span`
  color: ${colors.label};
  font-size: ${fontSizes.base}px;
  font-weight: 300;
`;

const Status = styled.div`
  color: ${({ theme }) => theme.colorText};
  font-size: ${fontSizes.base}px;
  font-weight: 300;
  line-height: normal;
  padding-left: 18px;
  padding-right: 18px;
  padding-top: 10px;
  padding-bottom: 10px;
  margin-right: 10px;
  margin-bottom: 10px;
  cursor: pointer;
  border-radius: ${(props: any) => props.theme.borderRadius};

  &:hover,
  &.active {
    color: #fff;
    background: #448943;

    ${Count} {
      color: #fff;
    }
  }
`;

interface InputProps {
  className?: string;
}

interface DataProps {
  ideaStatuses: GetIdeaStatusesChildProps;
}

interface Props extends InputProps, DataProps {}

const AreaFilter = memo<Props>(({ ideaStatuses, className }) => {
  if (!isNilOrError(ideaStatuses) && ideaStatuses.length > 0) {
    return (
      <Container className={className}>
        <Title>
          <FormattedMessage {...messages.statusTitle} />
        </Title>

        {ideaStatuses.map((ideaStatus) => (
          <Status key={ideaStatus.id}>
            <T value={ideaStatus.attributes.title_multiloc}>
              {ideaStatusTitle => <>{capitalize(ideaStatusTitle)}</>}
            </T>
            <Count>244</Count>
          </Status>
        ))}
      </Container>
    );
  }

  return null;
});

const Data = adopt<DataProps, InputProps>({
  ideaStatuses: <GetIdeaStatuses/>
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <AreaFilter {...inputProps} {...dataProps} />}
  </Data>
);
