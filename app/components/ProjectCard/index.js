import React from 'react';
import PropTypes from 'prop-types';
import ImPropTypes from 'react-immutable-proptypes';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import T from 'containers/T';
import Icon from 'components/UI/Icon';
import Button from 'components/UI/Button';
import { Link } from 'react-router';

import { makeSelectCurrentTenantImm } from 'utils/tenant/selectors';
// store
import { createStructuredSelector } from 'reselect';
import { preprocess } from 'utils';
import { push } from 'react-router-redux';

import { selectProject, selectProjectImages } from './selectors';
import messages from './messages';


const ProjectContainer = styled.div`
  width: 100%;
  display: flex;
  height: 400px;
  background: #fff;
  border-radius: 5px;
  margin-bottom: 20px;
`;

const ProjectImage = styled.img`
  height: 100%;
  object-fit: cover;
  border-radius: 5px 0 0 5px;
`;

const ProjectInfo = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding: 30px 40px;
`;

const InfoHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const HeaderLogo = styled.img`
`;

const HeaderCount = styled.div`
  display: flex;
  color: #8F8F8F;
  font-size: 16px;
  font-weight: 500;
`;

const InfoSeparator = styled.div`
  border: 1px solid #EAEAEA;
  height: 1px;
  margin: 10px 0;
`;

const InfoText = styled.div`
  flex-grow: 1;
`;

const TextTitle = styled.h3`
  color: #222222;
  font-size: 25px;
  font-weight: bold;
  margin: 15px 0;
`;

const TextBody = styled.div`
  font-size: 16px;
  font-weight: 300;
  color: #6B6B6B;
`;

const InfoFooter = styled.div`
`;

const OpenProjectButton = styled(Button)`
  width: 100%;
`;

class Project extends React.Component {
  render() {
    const { project, tenantLogo, images } = this.props;
    if (!project) return null;

    const projectId = project.get('id');
    const titleMultiloc = project.getIn(['attributes', 'title_multiloc']);
    const descriptionMultiloc = project.getIn(['attributes', 'description_multiloc']);
    const ideasCount = project.getIn(['attributes', 'ideas_count']);
    const image = images.first();
    const imageUrl = image && image.getIn(['attributes', 'versions', 'medium']);

    return (
      <ProjectContainer>
        <ProjectImage src={imageUrl} />
        <ProjectInfo>

          <InfoHeader>
            <HeaderLogo src={tenantLogo} />
            <HeaderCount>
              <Icon name="idea" />
              <FormattedMessage {...messages.xIdeas} values={{ x: ideasCount }} />
            </HeaderCount>
          </InfoHeader>

          <InfoSeparator />

          <InfoText>
            <TextTitle>
              <T value={titleMultiloc} />
            </TextTitle>
            <TextBody>
              <T value={descriptionMultiloc} />
            </TextBody>
          </InfoText>

          <InfoFooter>
            <Link to={`/projects/${projectId}`}>
              <OpenProjectButton>
                <FormattedMessage {...messages.openProjectButton} />
              </OpenProjectButton>
            </Link>
          </InfoFooter>

        </ProjectInfo>
      </ProjectContainer>
    );
  }
}

const mapStateToProps = () => createStructuredSelector({
  project: selectProject,
  images: selectProjectImages,
  tenantLogo: makeSelectCurrentTenantImm('attributes', 'logo', 'small'),
});

Project.propTypes = {
  project: ImPropTypes.map.isRequired,
  images: ImPropTypes.list,
  tenantLogo: PropTypes.string,
  goTo: PropTypes.func.isRequired,
};

export default preprocess(mapStateToProps, { goTo: push })(Project);
