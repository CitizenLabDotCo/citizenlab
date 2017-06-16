import React from 'react';
import PropTypes from 'prop-types';
import { Grid } from 'semantic-ui-react';
import T from 'containers/T';
import messages from './messages';
import styled from 'styled-components';

class ProjectEvent extends React.PureComponent {
  getPhaseTitle = (phase, intl) => {
    const { formatMessage } = intl;

    if (phase === 'current') {
      return formatMessage(messages.currentPhase);
    } else if (phase === 'past') {
      return formatMessage(messages.pastPhase);
    }

    // coming phase
    return formatMessage(messages.comingPhase);
  };

  render() {
    const { fromTo, tillTo, fromTime, tillTime, event, titleMultiloc, descriptionMultiLoc, className } = this.props;

    return (<Grid className={className}>
      <Grid.Row>
        TODO
      </Grid.Row>
    </Grid>);
  }
}

ProjectEvent.propTypes = {
  className: PropTypes.string,
  event: PropTypes.string.isRequired,
  fromTo: PropTypes.string.isRequired,
  tillTo: PropTypes.string.isRequired,
  fromTime: PropTypes.string.isRequired,
  tillTime: PropTypes.string.isRequired,
  titleMultiloc: PropTypes.object.isRequired,
  descriptionMultiLoc: PropTypes.object.isRequired,
};

export default styled(ProjectEvent)`
  opacity: ${(props) => props.event === 'past' ? '0.7' : 'inherit'};
`;
