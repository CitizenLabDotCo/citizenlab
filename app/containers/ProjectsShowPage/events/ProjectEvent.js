import React from 'react';
import PropTypes from 'prop-types';
import { Image, Grid } from 'semantic-ui-react';
import T from 'containers/T';
import styled from 'styled-components';
import { media } from 'utils/styleUtils';
import * as locationIcon from './assets/location_icon.png';

const EventYearStyled = styled.div`
  color: #ffffff;
  font-size: 16px;
  border-radius: 5px;
  background-color: #373737;
  position: absolute;
  bottom: 0;
  padding: 5px;
  width: 100%;
  display: table-cell;
  margin-left: -100%;
`;

const EventDate = ({ fromTo, tillTo, className }) => (<div className={className}>
  <EventDateInnerStyled>
    {fromTo.day}<br />{fromTo.month}
    {(fromTo.day !== tillTo.day) && <div>-<br />{tillTo.day}<br />{tillTo.month}</div>}
  </EventDateInnerStyled>
  <EventYearStyled>{fromTo.year}</EventYearStyled>

</div>);

const EventDateStyled = styled(EventDate)`
  border-radius: 5px;
  background-color: ${(props) => (props.event === 'current' || props.event === 'coming' ? '#f64a00' : '#cfcfcf')};
  height: ${(props) => props.fromTo.day === props.tillTo.day ? '130px' : '200px'};
  font-size: 25px;
  font-weight: bold;
  line-height: 1.08;
  color: #ffffff;
  text-align: center;
  width: 20%;
  position: relative;
  display: table;
`;

const EventDateInnerStyled = styled.div`
  display: table-cell;
  vertical-align: middle;
`;

const TimeLabel = styled.span`
  display: inline-block;
`;

const EventHeader = ({ fromTime, tillTime, className }) => (<div className={className}>
  <TimeLabel>{fromTime}</TimeLabel>&nbsp; -<TimeLabel>{tillTime}</TimeLabel>
</div>);

const EventHeaderStyled = styled(EventHeader)`
  font-size: 16px;
  color: #939393;
`;

const EventTitleStyled = styled.div`
  font-size: 20px;
  margin-top: 10px;
  font-weight: 600;
  color: #141414;
`;

const EventDescriptionStyled = styled.div`
  font-size: 16px;
  color: #939393;
  margin-top: 15px;
`;

const EventInformation = ({ fromTime, tillTime, titleMultiloc, className, descriptionMultiloc }) => (<div className={className}>
  <EventHeaderStyled
    fromTime={fromTime}
    tillTime={tillTime}
  />
  <EventTitleStyled>
    <T value={titleMultiloc} />
  </EventTitleStyled>
  <EventDescriptionStyled>
    <T value={descriptionMultiloc} />
  </EventDescriptionStyled>
</div>);

const EventInformationColumn = styled.div`
  border-right: 3px solid #eaeaea;
  padding: 5px 20px;
  width: 50%;
  
   ${media.phone`
    width: 80%;
    border-right: none;
  `}
`;

const EventAddressStyled = styled.div`
  font-size: 16px;
  color: #939393;
`;

const EventLocation = ({ locationMultiloc, className }) => (<div className={className}><Grid>
  <Grid.Row>
    <Grid.Column width={4}>
      <Image src={locationIcon} />
    </Grid.Column>
    <Grid.Column
      width={12}
      style={{
        padding: '0 10px 0 0 !important',
      }}
    >
      <EventAddressStyled>
        <T value={locationMultiloc} />
      </EventAddressStyled>
    </Grid.Column>
  </Grid.Row>
</Grid></div>);

const EventLocationStyled = styled(EventLocation)`
  padding: 5px 0 0 15px;
  width: 30%;
  
  ${media.phone`
    width: 60%;
    margin: auto;
  `}
`;

class ProjectEvent extends React.PureComponent {
  render() {
    const {
      fromTo, tillTo, fromTime, event, tillTime, titleMultiloc,
      descriptionMultiloc, locationMultiloc, className,
    } = this.props;

    return (<div className={className}>
      <EventDateStyled
        fromTo={fromTo}
        tillTo={tillTo}
        event={event}
      />
      <EventInformationColumn><EventInformation
        fromTime={fromTime}
        tillTime={tillTime}
        titleMultiloc={titleMultiloc}
        descriptionMultiloc={descriptionMultiloc}
      /></EventInformationColumn>
      <EventLocationStyled
        locationMultiloc={locationMultiloc}
      />
    </div>);
  }
}

ProjectEvent.propTypes = {
  className: PropTypes.string,
  event: PropTypes.string.isRequired,
  fromTo: PropTypes.object.isRequired,
  tillTo: PropTypes.object.isRequired,
  fromTime: PropTypes.string.isRequired,
  tillTime: PropTypes.string.isRequired,
  titleMultiloc: PropTypes.object.isRequired,
  descriptionMultiloc: PropTypes.object.isRequired,
  locationMultiloc: PropTypes.object.isRequired,
};

EventDate.propTypes = {
  fromTo: PropTypes.object.isRequired,
  tillTo: PropTypes.object.isRequired,
  className: PropTypes.string,
};

EventHeader.propTypes = {
  fromTime: PropTypes.string.isRequired,
  tillTime: PropTypes.string.isRequired,
  className: PropTypes.string,
};

EventInformation.propTypes = {
  fromTime: PropTypes.string.isRequired,
  tillTime: PropTypes.string.isRequired,
  descriptionMultiloc: PropTypes.object.isRequired,
  titleMultiloc: PropTypes.object.isRequired,
  className: PropTypes.string,
};

EventLocation.propTypes = {
  locationMultiloc: PropTypes.object.isRequired,
  className: PropTypes.string,
};

export default styled(ProjectEvent)`
  opacity: ${(props) => props.event === 'past' ? '0.7' : 'inherit'};
  min-height: 166px;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content:: center;
  width: 70%;
  margin: 12px auto !important;
  padding: 10px;
  border-radius: 5px;
  background-color: #ffffff;
  border: solid 1px #eaeaea;
  
  ${media.phone`
    width: 90%;
  `}
  
  ${media.tablet`
    width: 50%;
  `}
`;
