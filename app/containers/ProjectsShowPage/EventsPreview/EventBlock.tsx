// Libraries
import * as React from 'react';
import * as moment from 'moment';

// Services
import { IEventData } from 'services/events';

// Components
import T from 'components/T';
import Icon from 'components/UI/Icon';
import { Link } from 'react-router';

// Styling
import styled from 'styled-components';
import { color, fontSize, media } from 'utils/styleUtils';

const Container = styled(Link)`
  width: calc(100% * (1/3) - 26px);
  margin-left: 13px;
  margin-right: 13px;
  background: white;
  border-radius: 5px;
  display: flex;
  padding: 15px;
  cursor: pointer;
  box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.12);
  transition: transform 250ms ease-out;

  &:hover {
    transform: scale(1.01);
  }

  &:not(.last) {
    margin-right: 12px;
  }

  ${media.smallerThanMaxTablet`
    width: 100%;
    margin: 0;
    margin-bottom: 15px;
  `}
`;

const DateWrapper = styled.div`
  width: 80px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  margin-right: 20px;
`;

const Date = styled.div`
  width: 100%;
  color: #fff;;
  font-size: 16px;
  font-weight: 500;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 10px;
  padding-bottom: 10px;
  border-radius: 5px 5px 0 0;
  background: #F64A00;
`;

const Year = styled.div`
  width: 100%;
  color: #fff;
  font-size: 15px;
  font-weight: 300;
  text-align: center;
  padding-top: 10px;
  padding-bottom: 10px;
  border-radius: 0 0 5px 5px;
  background: #373737;
`;

const TextBlock = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const Time = styled.div`
  color: ${color('label')};
  font-size: ${fontSize('small')};
  margin-bottom: 8px;
`;

const Title = styled.div`
  color: #333;
  font-size: 16px;
  font-weight: 400;
  line-height: 20px;
`;

const Location = styled.div`
  color: ${color('label')};
  font-size: ${fontSize('small')};
  display: flex;
  align-items: center;
  display: none;
`;

const StyledIcon = styled(Icon)`
  flex: 0 0 20px;
  height: 20px;
  fill: ${color('label')};
  margin-right: 5px;
`;

interface Props {
  event: IEventData;
  projectSlug: string;
  isLast: boolean;
  className?: string;
}

interface State {
  isMultiDayEvent: boolean;
}

export default class EventBlock extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      isMultiDayEvent: !moment(props.event.attributes.start_at).isSame(props.event.attributes.end_at, 'day'),
    };
  }

  render() {
    const { projectSlug, event, isLast } = this.props;
    const { isMultiDayEvent } = this.state;

    const startAtMoment = moment(event.attributes.start_at);
    const endAtMoment = moment(event.attributes.end_at);
    const startAtDay = startAtMoment.format('DD');
    const endAtDay = endAtMoment.format('DD');
    const startAtMonth = startAtMoment.format('MMM');
    const endAtMonth = endAtMoment.format('MMM');
    const startAtYear = startAtMoment.format('YYYY');
    const dateFormat = (!isMultiDayEvent ? 'LT' : 'D MMM LT');
    const startAt = moment(event.attributes.start_at).format(dateFormat);
    const endAt = moment(event.attributes.end_at).format(dateFormat);

    return (
      <Container className={`${this.props.className} ${isLast && 'last'}`} to={`/projects/${projectSlug}/events`}>
        <DateWrapper>
          <Date>
            <span>{startAtDay}</span>
            <span>{startAtMonth}</span>

            {isMultiDayEvent &&
              <React.Fragment>
                <span>-</span>
                <span>{endAtDay}</span>
                <span>{endAtMonth}</span>
              </React.Fragment>
            }
          </Date>
          <Year>
            {startAtYear}
          </Year>
        </DateWrapper>

        <TextBlock>
          <Time>{startAt} - {endAt}</Time>
          <Title><T value={event.attributes.title_multiloc} /></Title>
          <Location>
            <StyledIcon name="mapmarker" />
            <T value={event.attributes.location_multiloc} />
          </Location>
        </TextBlock>
      </Container>
    );
  }
}
