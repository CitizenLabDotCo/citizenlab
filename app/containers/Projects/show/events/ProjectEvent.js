import React from 'react';
import PropTypes from 'prop-types';
import { Grid } from 'semantic-ui-react';
import T from 'containers/T';
import styled from 'styled-components';

const EventYearStyled = styled.div`
  // TODO
`;

const EventDate = ({ fromTo, tillTo }) => (<div>
  <div>{fromTo.day}<br />{fromTo.month}</div>
  {fromTo.day !== tillTo.day && <div>-<br />{tillTo.day}<br />{tillTo.month}</div>}
  <EventYearStyled>{fromTo.year}</EventYearStyled>
</div>);

const EventDateStyled = styled(EventDate)`
  // TODO (also different BKG based on event == "current / coming")
`;

const EventHeader = ({ fromTime, tillTime }) => (<div>
  {fromTime} - {tillTime}
</div>);

const EventHeaderStyled = styled(EventHeader)`
  // TODO
`;

const EventTitleStyled = styled.div`
  // TODO
`;

const EventDescriptionStyled = styled.div`
  // TODO
`;

const EventInformation = ({ fromTime, tillTime, titleMultiloc, descriptionMultiloc }) => (<div>
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

const EventLocation = ({ locationMultiloc }) => (<div>
  <T value={locationMultiloc} />
</div>);

const EventLocationStyled = styled(EventLocation)`
  // TODO
`;

class ProjectEvent extends React.PureComponent {
  render() {
    const {
      fromTo, tillTo, fromTime, event, tillTime, titleMultiloc,
      descriptionMultiloc, locationMultiloc, className,
    } = this.props;

    return (<Grid.Row className={className}>
      <Grid.Column width={2}>
        <EventDateStyled
          fromTo={fromTo}
          tillTo={tillTo}
          event={event}
        />
      </Grid.Column>
      <Grid.Column width={7}>
        <EventInformation
          fromTime={fromTime}
          tillTime={tillTime}
          titleMultiloc={titleMultiloc}
          descriptionMultiloc={descriptionMultiloc}
        />
      </Grid.Column>
      <Grid.Column width={7}>
        <EventLocationStyled
          locationMultiloc={locationMultiloc}
        />
      </Grid.Column>
    </Grid.Row>);
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
};

EventHeader.propTypes = {
  fromTime: PropTypes.string.isRequired,
  tillTime: PropTypes.string.isRequired,
};

EventInformation.propTypes = {
  fromTime: PropTypes.string.isRequired,
  tillTime: PropTypes.string.isRequired,
  descriptionMultiloc: PropTypes.object.isRequired,
  titleMultiloc: PropTypes.object.isRequired,
};

EventLocation.propTypes = {
  locationMultiloc: PropTypes.object.isRequired,
};

export default styled(ProjectEvent)`
  opacity: ${(props) => props.event === 'past' ? '0.7' : 'inherit'};
  min-height: 140px;
`;
