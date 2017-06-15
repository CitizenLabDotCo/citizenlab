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
  max-width: 820.3px;
  min-height: 398px;
  margin: 15px auto;
  border-radius: 5px;
  border-left: ${(props) => props.current ? `3px ${props.theme.mainFg} solid` : 'inherit'};
  background-color: #ffffff;
  box-shadow: 0 1px 20px 0 rgba(0, 0, 0, 0.07);
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
const ProjectPhaseHeader = ({ title, fromTo, tillTo, current }) => (<Grid>
  <Grid.Row>
    <Grid.Column width={2}>
      {/* NONE HERE (no offset property available */}
    </Grid.Column>
    <Grid.Column width={8}>
      <ProjectPhaseNameStyled current>{title}</ProjectPhaseNameStyled>
    </Grid.Column>
    <Grid.Column width={6} textAlign="center">
      <strong>{fromTo} - {tillTo}</strong>
    </Grid.Column>
  </Grid.Row>
</Grid>);

const ProjectPhaseNameStyled = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: ${(props) => (props.current ? props.theme.mainFg : 'gray')};
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

const ProjectPhaseHeaderStyled = styled(ProjectPhaseHeader)`
  height: 40px;
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
  border-radius: 20px;
  color: #ffffff;
  text-align: center;
  font-weight: bold;
  font-size: 16px;
  padding-top: 12px;
  background-color: ${(props) => (props.current ? props.theme.mainFg : 'gray')}
`;

// eslint-disable-next-line no-unused-vars
const ProjectPhase = ({ intl, fromTo, tillTo, current, phaseIndex, titleMultiloc, descriptionMultiLoc }) => (<Grid>
  <Grid.Row>
    <Grid.Column verticalAlign="middle" width={1}>
      <ProjectPhaseIndexStyled current>
        {phaseIndex}
      </ProjectPhaseIndexStyled>
    </Grid.Column>
    <Grid.Column width={15}>
      <ProjectPhaseOuterStyled current>
        <ProjectPhaseHeaderStyled
          title={intl.formatMessage(messages.currentPhase)}
          current
          fromTo={parseDate(fromTo)}
          tillTo={parseDate(tillTo)}
        />
        <ProjectPhaseInnerStyled
          titleMultiloc={titleMultiloc}
          descriptionMultiloc={descriptionMultiLoc}
        />
      </ProjectPhaseOuterStyled>
    </Grid.Column>
  </Grid.Row>
</Grid>);


/* @params:
 * - Date iso: string
 * @returns
 * - date: string
 */
const parseDate = (dateIsoString) => {
  // TODO
  console.log(dateIsoString);
  return 'X Y';
};

const ProjectsTimeline = ({ routeParams, intl }) => (<div>
  <h1><FormattedMessage {...messages.header} /></h1>
  {routeParams.projectId}
  <ProjectPhasesStyled>
    <ProjectPhase
      phaseIndex={4}
      intl={intl}
      current
      fromTo="2017-06-07T18:47:32.665Z"
      tillTo="2017-06-07T18:47:32.665Z"
      titleMultiloc={{ en: 'Bycilelane from Ostende to Knokke and LaPanne' }}
      descriptionMultiLoc={{ en: 'It is particularly annoying to get younger kids to cooperate during travel. But it is not their fault, because at their age they are naturally more inquisitive and more active. They are not content to stay put and lounge in the beach or hotel. They want lots of actions, something that your dream beach vacation cannot satisfy. Why not change your dream relaxation vacation to a fun family holiday? Virginia travel offers two exciting and affordable theme parks for your family’s enjoyment.' }}
    />
  </ProjectPhasesStyled>
</div>);

ProjectsTimeline.propTypes = {
  intl: intlShape.isRequired,
  routeParams: PropTypes.object.isRequired,
};

ProjectPhase.propTypes = {
  intl: intlShape.isRequired,
  fromTo: PropTypes.string.isRequired,
  tillTo: PropTypes.string.isRequired,
  current: PropTypes.bool,
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
  current: PropTypes.bool,
  title: PropTypes.string.isRequired,
};

export default injectIntl(ProjectsTimeline);
