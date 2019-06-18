import React, { memo, useCallback, MouseEvent } from 'react';
import { adopt } from 'react-adopt';
import { capitalize, get } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

// components
import T from 'components/T';
import Icon from 'components/UI/Icon';

// resources
import GetIdeaStatuses, { GetIdeaStatusesChildProps } from 'resources/GetIdeaStatuses';
import GetIdeasFilterCounts, { GetIdeasFilterCountsChildProps } from 'resources/GetIdeasFilterCounts';

// styling
import styled from 'styled-components';
import { fontSizes, colors } from 'utils/styleUtils';
import { darken } from 'polished';
import { Header, Title } from './styles';

// typings
import { IQueryParameters } from 'resources/GetIdeas';

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
  transition: all 80ms ease-out;
`;

const CloseIcon = styled(Icon)`
  width: 12px;
  height: 12px;
  fill: #fff;
`;

const Status = styled.button`
  color: ${({ theme }) => theme.colorText};
  font-size: ${fontSizes.base}px;
  font-weight: 400;
  line-height: normal;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-left: 18px;
  padding-right: 18px;
  padding-top: 7px;
  padding-bottom: 7px;
  margin: 0px;
  margin-right: 10px;
  margin-bottom: 6px;
  cursor: pointer;
  border-radius: 5px;
  user-select: none;
  transition: all 80ms ease-out;

  &:not(.selected):hover {
    background: rgba(132, 147, 158, 0.15);
  }

  &.selected {
    color: #fff;
    background: ${({ theme }) => theme.colorSecondary};

    &:hover {
      background: ${({ theme }) => darken(0.15, theme.colorSecondary)};
    }

    ${Count} {
      color: #fff;
    }
  }
`;

const AllStatus = styled(Status)``;

interface InputProps {
  selectedStatusId: string | null | undefined;
  selectedIdeaFilters: Partial<IQueryParameters>;
  onChange: (arg: string | null) => void;
  className?: string;
}

interface DataProps {
  ideaStatuses: GetIdeaStatusesChildProps;
  ideasFilterCounts: GetIdeasFilterCountsChildProps;
}

interface Props extends InputProps, DataProps {}

const StatusFilter = memo<Props>(({ selectedStatusId, ideaStatuses, ideasFilterCounts, onChange, className }) => {

  const handleOnClick = useCallback((event: MouseEvent<HTMLElement>) => {
    event.preventDefault();
    const statusId = event.currentTarget.dataset.id as string;
    const nextSelectedStatusId = (selectedStatusId !== statusId ? statusId : null);
    onChange(nextSelectedStatusId);
  }, [selectedStatusId]);

  const removeFocus = useCallback((event: MouseEvent<HTMLElement>) => {
    event.preventDefault();
  }, []);

  if (!isNilOrError(ideaStatuses) && ideaStatuses.length > 0) {
    return (
      <Container className={className}>
        <Header>
          <Title>
            <FormattedMessage {...messages.statusTitle} />
          </Title>
        </Header>

        <AllStatus
          data-id={null}
          onMouseDown={removeFocus}
          onClick={handleOnClick}
          className={!selectedStatusId ? 'selected' : ''}
        >
          <FormattedMessage {...messages.all} />
          <Count>
            {get(ideasFilterCounts, 'total', 0)}
          </Count>
        </AllStatus>

        {ideaStatuses.map((ideaStatus) => (
          <Status
            key={ideaStatus.id}
            data-id={ideaStatus.id}
            onMouseDown={removeFocus}
            onClick={handleOnClick}
            className={selectedStatusId === ideaStatus.id ? 'selected' : ''}
          >
            <T value={ideaStatus.attributes.title_multiloc}>
              {ideaStatusTitle => <>{capitalize(ideaStatusTitle)}</>}
            </T>
            {selectedStatusId !== ideaStatus.id ? (
              <Count>
                {get(ideasFilterCounts, `idea_status_id.${ideaStatus.id}`, 0)}
              </Count>
            ) : (
              <CloseIcon name="close2" />
            )}
          </Status>
        ))}
      </Container>
    );
  }

  return null;
});

const Data = adopt<DataProps, InputProps>({
  ideaStatuses: <GetIdeaStatuses/>,
  ideasFilterCounts: ({ selectedIdeaFilters, render }) => {
    const queryParameters = {
      ...selectedIdeaFilters,
      idea_status: undefined,
      project_publication_status: 'published',
      publication_status: 'published'
    } as Partial<IQueryParameters>;

    return <GetIdeasFilterCounts queryParameters={queryParameters}>{render}</GetIdeasFilterCounts>;
  }
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <StatusFilter {...inputProps} {...dataProps} />}
  </Data>
);
