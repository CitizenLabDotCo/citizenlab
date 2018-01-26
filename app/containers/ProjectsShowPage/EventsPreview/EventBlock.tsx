// Libraries
import * as React from 'react';
import * as moment from 'moment';

// Services
import { IEventData } from 'services/events';

// Components
import T from 'components/T';
import { FormattedDate, FormattedTime } from 'react-intl';
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
  border: solid 1px #e0e0e0;
  display: flex;
  padding: 15px;
  cursor: pointer;
  transition: all 300ms cubic-bezier(0.19, 1, 0.22, 1);

  &:hover {
    box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.1);
  }

  &:not(.last) {
    margin-right: 12px;
  }

  ${media.smallerThanMaxTablet`
    width: 100%;
    margin: 0;
    margin-bottom: 15px;
  `}

  /* ${media.smallerThanMaxTablet`
    width: 100%;
    margin: 0;
    flex-direction: column;
  `} */
`;

const DateWrapper = styled.div`
  width: 80px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  margin-right: 20px;

  /* ${media.smallerThanMaxTablet`
    width: 80px;
    margin-left: auto;
    margin-right: auto;
  `} */
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
  font-size: 16px;
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

const Time = styled.p`
  color: ${color('label')};
  font-size: ${fontSize('small')};
`;

const Title = styled.p`
  color: ${color('text')};
  font-size: ${fontSize('base')};
`;

const Location = styled.p`
  color: ${color('label')};
  font-size: ${fontSize('small')};
  display: flex;
  align-items: center;
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
  separateDates: boolean;
}

export default class EventBlock extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      separateDates: !moment(props.event.attributes.start_at).isSame(props.event.attributes.end_at, 'day'),
    };
  }

  render() {
    const { projectSlug } = this.props;

    return (
      <Container className={`${this.props.className} ${this.props.isLast && 'last'}`} to={`/projects/${projectSlug}/events`}>
        <DateWrapper>
          <Date>
            <FormattedDate day="2-digit" value={this.props.event.attributes.start_at} />
            <FormattedDate month="short" value={this.props.event.attributes.start_at} />

            {this.state.separateDates &&
              <React.Fragment>
                <span>-</span>
                <FormattedDate day="2-digit" value={this.props.event.attributes.end_at} />
                <FormattedDate month="short" value={this.props.event.attributes.end_at} />
              </React.Fragment>
            }
          </Date>
          <Year>
            <FormattedDate year="numeric" value={this.props.event.attributes.start_at} />
          </Year>
        </DateWrapper>

        <TextBlock>
          <Time><FormattedTime value={this.props.event.attributes.start_at} /> - <FormattedTime value={this.props.event.attributes.end_at} /></Time>
          <Title><T value={this.props.event.attributes.title_multiloc} /></Title>
          <Location>
            <StyledIcon name="mapmarker" />
            <T value={this.props.event.attributes.location_multiloc} />
          </Location>
        </TextBlock>
      </Container>
    );
  }
}
