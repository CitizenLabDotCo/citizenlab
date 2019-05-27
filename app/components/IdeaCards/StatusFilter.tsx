import React,{ memo, useState, useCallback, useEffect, MouseEvent } from 'react';
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
import GetIdeaStatuses, { GetIdeaStatusesChildProps } from 'resources/GetIdeaStatuses';

// styling
import styled from 'styled-components';
import { Header, Title, ClearButtonWrapper, ClearButtonIcon, ClearButtonText } from './styles';

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

const Count = styled.span`
  color: ${colors.label};
  font-size: ${fontSizes.base}px;
  font-weight: 300;
`;

const Status = styled.div`
  color: ${({ theme }) => theme.colorText};
  font-size: ${fontSizes.base}px;
  font-weight: 400;
  line-height: normal;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-left: 18px;
  padding-right: 18px;
  padding-top: 10px;
  padding-bottom: 10px;
  margin-right: 10px;
  margin-bottom: 6px;
  cursor: pointer;
  border-radius: ${(props: any) => props.theme.borderRadius};
  user-select: none;

  &:not(.selected):hover {
    background: #eee;
  }

  &.selected {
    color: #fff;
    background: #448943;

    ${Count} {
      color: #fff;
    }
  }
`;

interface InputProps {
  onChange: (arg: string | null) => void;
  className?: string;
}

interface DataProps {
  ideaStatuses: GetIdeaStatusesChildProps;
}

interface Props extends InputProps, DataProps {}

const StatusFilter = memo<Props>(({ ideaStatuses, onChange, className }) => {

  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  const handleOnClick = useCallback((event: MouseEvent<HTMLInputElement>) => {
    event.preventDefault();
    const statusId = event.currentTarget.dataset.id as string;

    if (selectedStatus !== statusId) {
      setSelectedStatus(statusId);
    } else {
      setSelectedStatus(null);
    }
  }, [selectedStatus]);

  const handleOnClear = useCallback((event: MouseEvent<HTMLInputElement>) => {
    event.preventDefault();
    setSelectedStatus(null);
  }, []);

  useEffect(() => {
    onChange(selectedStatus);
  }, [selectedStatus]);

  if (!isNilOrError(ideaStatuses) && ideaStatuses.length > 0) {
    return (
      <Container className={className}>
        <Header>
          <Title>
            <FormattedMessage {...messages.statusTitle} />
          </Title>
          <ClearButtonWrapper
            role="button"
            onClick={handleOnClear}
            className={selectedStatus ? 'visible' : 'hidden'}
          >
            <ClearButtonIcon name="close4" />
            <ClearButtonText>
              <FormattedMessage {...messages.clear} />
            </ClearButtonText>
          </ClearButtonWrapper>
        </Header>

        {ideaStatuses.map((ideaStatus) => (
          <Status
            key={ideaStatus.id}
            data-id={ideaStatus.id}
            onClick={handleOnClick}
            className={selectedStatus === ideaStatus.id ? 'selected' : ''}
          >
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
    {dataProps => <StatusFilter {...inputProps} {...dataProps} />}
  </Data>
);
