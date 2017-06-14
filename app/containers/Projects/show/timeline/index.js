import React from 'react';
import PropTypes from 'prop-types';
import messages from './messages';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import styled from 'styled-components';
import { Grid } from 'semantic-ui-react';
import T from 'containers/T';

const ProjectPhasesStyled = styled.div`
  width: 100%;
`;

const ProjectPhaseOuterStyled = styled.div`
  width: 70%;
  max-width: 820.3px;
  height: 398px;
  margin: 15px auto;
  border-radius: 5px;
  background-color: #ffffff;
  box-shadow: 0 1px 20px 0 rgba(0, 0, 0, 0.07);
`;

const ProjectPhaseHeader = ({ title, fromTo, tillTo }) => (<Grid>
  <Grid.Row>
    <Grid.Column width={2}>
      {/* NONE HERE (no offset property available */}
    </Grid.Column>
    <Grid.Column width={8}>
      {title}
    </Grid.Column>
    <Grid.Column width={6} textAlign="center">
      <strong>{fromTo} - {tillTo}</strong>
    </Grid.Column>
  </Grid.Row>
</Grid>);

const ProjectTitleStyled = styled.div`
  font-weight: bold;
  font-family: ProximaNova;
  font-size: 25px;
  color: #000000;
  margin-top: 47px;
`;

const ProjectDescriptionStyled = styled.div`
  font-family: ProximaNova;
  font-size: 16px;
  line-height: 1.38;
  margin-top: 22px;
`;

const ProjectPhaseHeaderStyled = styled(ProjectPhaseHeader)`
  height: 40px;
`;

const ProjectPhaseInner = ({ titleMultiloc, descriptionMultiloc }) => (<Grid>
  <Grid.Row>
    <Grid.Column width={2}>
      {/* NONE HERE (no offset property available */}
    </Grid.Column>
    <Grid.Column width={8}>
      <ProjectTitleStyled>
        <T value={titleMultiloc} />
      </ProjectTitleStyled>
      <ProjectDescriptionStyled>
        <T value={descriptionMultiloc} />
      </ProjectDescriptionStyled>
    </Grid.Column>
  </Grid.Row>
</Grid>);

const ProjectPhaseInnerStyled = styled(ProjectPhaseHeader)`
  // none yet
`;

/* @params:
 * - timestamp: number
 * @returns
 * - date: string
 */
const parseDate = (timestamp) => {
  // TODO
  return 'X month';
};

const ProjectsTimeline = ({ routeParams, intl }) => (
  <ProjectPhasesStyled>
    <h1><FormattedMessage {...messages.header} /></h1>
    {routeParams.projectId}

    <ProjectPhaseOuterStyled>
      <ProjectPhaseHeaderStyled
        title={intl.formatMessage(messages.currentPhase)}
        fromTo={parseDate('2017-06-07T18:47:32.665Z')}
        tillTo={parseDate('2017-06-07T18:47:32.665Z')}
      />
      <ProjectPhaseInner
        titleMultiloc={{ en: 'test' }}
        descriptionMultiloc={{ en: 'test1111111111111111111111111111 11111111111111 1111111111111111111111111111111111111 11111111 ffrfrfrf' }}
      />
    </ProjectPhaseOuterStyled>
  </ProjectPhasesStyled>
);

ProjectsTimeline.propTypes = {
  intl: intlShape.isRequired,
  routeParams: PropTypes.object.isRequired,
};

export default injectIntl(ProjectsTimeline);
