import React from 'react';
import PropTypes from 'prop-types';
import { Grid } from 'semantic-ui-react';
import T from 'components/T';
import messages from './messages';
import { intlShape } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';
import styled from 'styled-components';

const ProjectPhaseOuterStyled = styled.div`
  max-width: 820.3px;
  min-height: 398px;
  margin: 15px auto;
  border-radius: 5px;
  border-left: ${(props) => props.phase === 'current' ? '3px #00bc6a solid' : 'inherit'};
  background-color: #ffffff;
  box-shadow: 0 1px ${(props) => props.phase === 'current' ? ' 20px' : '2px'} 0 rgba(0, 0, 0, 0.07);
`;

const ProjectTitleStyled = styled.div`
  font-size: 25px;
  font-weight: bold;
  text-align: left;
  color: #000000;
  width: 60%;
  line-height: 25px;
`;

// eslint-disable-next-line no-unused-vars
const ProjectPhaseHeader = ({ title, fromTo, tillTo, phase, className }) => (<Grid className={className}>
  <Grid.Row>
    <Grid.Column width={2}>
      {/* NONE HERE (no offset property available */}
    </Grid.Column>
    <Grid.Column width={8}>
      <ProjectPhaseNameStyled phase={phase}>{title}</ProjectPhaseNameStyled>
    </Grid.Column>
    <Grid.Column width={6} textAlign="center">
      <strong>{fromTo} - {tillTo}</strong>
    </Grid.Column>
  </Grid.Row>
</Grid>);

const ProjectPhaseHeaderStyled = styled(ProjectPhaseHeader)`
  height: 40px;
  background-color: #f9f9f9;
  border-bottom: 1px solid #eaeaea;
  margin: 0 !important;
`;

const ProjectPhaseNameStyled = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: ${(props) => (props.phase === 'current' ? '#32b67a' : 'gray')};
`;

const ProjectDescriptionStyled = styled.div`
  font-size: 16px;
  margin-top: 22px;
  line-height: 1.38;
  text-align: left;
  color: #777777;
  width: 80%;
  overflow-wrap: break-word
`;

const ProjectPhaseInner = ({ titleMultiloc, descriptionMultiloc }) => (<Grid>
  <Grid.Row>
    <Grid.Column width={2}>
      {/* NONE HERE (no offset property available */}
    </Grid.Column>
    <Grid.Column width={12}>
      <ProjectTitleStyled>
        <T value={titleMultiloc} />
      </ProjectTitleStyled>
      <ProjectDescriptionStyled>
        <T value={descriptionMultiloc} />
      </ProjectDescriptionStyled>
    </Grid.Column>
  </Grid.Row>
</Grid>);

const ProjectPhaseInnerStyled = styled(ProjectPhaseInner)`
  // none yet
`;

const ProjectPhaseIndexStyled = styled.div`
  width: 41px;
  height: 41px;
  border-radius: 50%;
  color: #ffffff;
  text-align: center;
  font-weight: bold;
  font-size: 16px;
  padding-top: 10px;
  background-color: ${(props) => (props.phase === 'current' ? '#32b67a' : 'gray')}
`;

class ProjectPhase extends React.PureComponent {
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
    const { intl, fromTo, tillTo, phase, phaseIndex, titleMultiloc, descriptionMultiLoc, className } = this.props;

    return (<Grid className={className}>
      <Grid.Row>
        <Grid.Column verticalAlign="middle" width={1}>
          <ProjectPhaseIndexStyled phase={phase}>
            {phaseIndex}
          </ProjectPhaseIndexStyled>
        </Grid.Column>
        <Grid.Column
          width={15}
        >
          <ProjectPhaseOuterStyled phase={phase}>
            <ProjectPhaseHeaderStyled
              title={this.getPhaseTitle(phase, intl)}
              phase={phase}
              fromTo={fromTo}
              tillTo={tillTo}
            />
            <ProjectPhaseInnerStyled
              titleMultiloc={titleMultiloc}
              descriptionMultiloc={descriptionMultiLoc}
            />
          </ProjectPhaseOuterStyled>
        </Grid.Column>
      </Grid.Row>
    </Grid>);
  }
}

ProjectPhase.propTypes = {
  className: PropTypes.string,
  intl: intlShape.isRequired,
  fromTo: PropTypes.string.isRequired,
  tillTo: PropTypes.string.isRequired,
  phase: PropTypes.string.isRequired,
  phaseIndex: PropTypes.number.isRequired,
  titleMultiloc: PropTypes.object.isRequired,
  descriptionMultiLoc: PropTypes.object.isRequired,
};

ProjectPhaseInner.propTypes = {
  titleMultiloc: PropTypes.object.isRequired,
  descriptionMultiloc: PropTypes.object.isRequired,
};

ProjectPhaseHeader.propTypes = {
  fromTo: PropTypes.string.isRequired,
  tillTo: PropTypes.string.isRequired,
  phase: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  className: PropTypes.string,
};

export default styled(injectIntl(ProjectPhase))`
  /* margin-top: ${(props) => props.phaseIndex === 1 ? '-150px !important' : 'inherit'}; */ // TODO: scroll behavior here
  opacity: ${(props) => props.phase === 'past' ? '0.7' : 'inherit'};
`;
