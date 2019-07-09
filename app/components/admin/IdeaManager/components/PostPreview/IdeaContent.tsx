import React, { PureComponent } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { adopt } from 'react-adopt';
import { get } from 'lodash-es';

// components
import IdeaAuthor from 'containers/IdeasShow/IdeaAuthor';
import IdeaTitle from 'containers/IdeasShow/IdeaTitle';
import IdeaBody from 'containers/IdeasShow/IdeaBody';
import IdeaMap from 'containers/IdeasShow/IdeaMap';
import OfficialFeedback from 'containers/IdeasShow/OfficialFeedback';
import Comments from 'containers/IdeasShow/Comments';
import FileAttachments from 'components/UI/FileAttachments';
import IdeaSettings from './IdeaSettings';
import VotePreview from './VotePreview';
import InfoTooltip from 'components/admin/InfoTooltip';
import Button from 'components/UI/Button';
import Link from 'utils/cl-router/Link';
import T from 'components/T';
import { Top, Content, Container } from '.';

// srvices
import { deleteIdea } from 'services/ideas';

// resources
import GetResourceFiles, { GetResourceFilesChildProps } from 'resources/GetResourceFiles';
import GetIdea, { GetIdeaChildProps } from 'resources/GetIdea';
import GetIdeaImages, { GetIdeaImagesChildProps } from 'resources/GetIdeaImages';
import GetTenant, { GetTenantChildProps } from 'resources/GetTenant';
import GetProject, { GetProjectChildProps } from 'resources/GetProject';

// i18n
import injectLocalize, { InjectedLocalized } from 'utils/localize';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import { InjectedIntlProps, FormattedNumber } from 'react-intl';
import messages from './messages';

// style
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';
import { darken } from 'polished';

const StyledIdeaTitle = styled(IdeaTitle)`
  margin-bottom: 30px;
`;

const Row = styled.div`
  display: flex;
  width: 100%;
`;

const Left = styled.div`
  flex: 5;
  margin-right: 50px;
  height: 100%;
`;

const BelongsToProject = styled.p`
  width: 100%;
  color: ${colors.label};
  font-weight: 300;
  font-size: ${fontSizes.base}px;
  line-height: normal;
  margin-bottom: 10px;
`;

const ProjectLink = styled(Link)`
  color: inherit;
  font-weight: 400;
  font-size: inherit;
  line-height: inherit;
  text-decoration: underline;
  transition: all 100ms ease-out;
  margin-left: 4px;

  &:hover {
    color: ${darken(0.2, colors.label)};
    text-decoration: underline;
  }
`;

const IdeaImage = styled.img`
  width: 100%;
  margin: 0 0 2rem;
  padding: 0;
  border-radius: 8px;
  border: 1px solid ${colors.separation};
`;

const StyledIdeaBody = styled(IdeaBody)`
  margin-bottom: 20px;
`;

const StyledIdeaMap = styled(IdeaMap)`
  margin-bottom: 40px;
`;

const StyledOfficialFeedback = styled(OfficialFeedback)`
  margin-top: 70px;
`;

const StyledComments = styled(Comments)`
  margin-top: 30px;
`;

const Right = styled.div`
  flex: 2;
  position: sticky;
  top: 80px;
  align-self: flex-start;
  color: ${colors.adminTextColor};
  font-size: ${fontSizes.base}px;
  line-height: 19px;
`;

const BudgetBox = styled.div`
  margin-top: 20px;
  width: 100%;
  height: 95px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 5px;
  position: relative;
  border-radius: 5px;
  background: ${colors.background};
  border: solid 1px ${colors.adminTextColor};
  font-size: ${fontSizes.large}px;
  font-weight: 500;
`;

const Picks = styled.div`
  margin-top: 7px;
  display: flex;
  font-size: ${fontSizes.base}px;
  align-items: center;
`;

interface State {}

interface InputProps {
  ideaId: string | null;
  closePreview: () => void;
  handleClickEdit: () => void;
}

interface DataProps {
  idea: GetIdeaChildProps;
  ideaImages: GetIdeaImagesChildProps;
  ideaFiles: GetResourceFilesChildProps;
  tenant: GetTenantChildProps;
  project: GetProjectChildProps;
}

interface Props extends InputProps, DataProps {}

export class IdeaContent extends PureComponent<Props & InjectedLocalized & InjectedIntlProps, State> {
  handleClickDelete = () => {
    const { idea, closePreview } = this.props;
    const message = this.props.intl.formatMessage(messages.deleteIdeaConfirmation);

    if (!isNilOrError(idea)) {
      if (window.confirm(message)) {
        deleteIdea(idea.id);
        closePreview();
      }
    }
  }

  render() {
    const {
      idea,
      project,
      localize,
      ideaImages,
      ideaFiles,
      tenant,
      handleClickEdit,
      intl: { formatMessage }
    } = this.props;

    if (!isNilOrError(idea)) {
      const ideaTitle = localize(idea.attributes.title_multiloc);
      const ideaImageLarge = !isNilOrError(ideaImages) && ideaImages.length > 0 ? get(ideaImages[0], 'attributes.versions.large', null) : null;
      const ideaGeoPosition = (idea.attributes.location_point_geojson || null);
      const ideaAddress = (idea.attributes.location_description || null);

      return (
        <Container>
          <Top>
            <Button
              icon="edit"
              style="text"
              textColor={colors.adminTextColor}
              onClick={handleClickEdit}
            >
              <FormattedMessage {...messages.edit}/>
            </Button>
            <Button
              icon="delete"
              style="text"
              textColor={colors.adminTextColor}
              onClick={this.handleClickDelete}
            >
              <FormattedMessage {...messages.delete}/>
            </Button>
          </Top>
          <Content>
            {!isNilOrError(project) &&
              <BelongsToProject>
                <FormattedMessage
                  {...messages.postedIn}
                  values={{
                    projectLink:
                      <ProjectLink className="e2e-project-link" to={`/projects/${project.attributes.slug}`}>
                        <T value={project.attributes.title_multiloc} />
                      </ProjectLink>
                  }}
                />
              </BelongsToProject>
            }

            <StyledIdeaTitle
              ideaId={idea.id}
              ideaTitle={ideaTitle}
            />
            <Row>
              <Left>
                {ideaImageLarge &&
                  <IdeaImage src={ideaImageLarge} alt={formatMessage(messages.imageAltText, { ideaTitle })} className="e2e-ideaImage"/>
                }
                <IdeaAuthor
                  authorId={get(idea, 'relationships.author.data.id', null)}
                  ideaCreatedAt={idea.attributes.created_at}
                  ideaId={idea.id}
                />

                <StyledIdeaBody
                  ideaId={idea.id}
                  ideaBody={localize(idea.attributes.body_multiloc)}
                />

                {ideaGeoPosition && ideaAddress &&
                  <StyledIdeaMap
                    address={ideaAddress}
                    position={ideaGeoPosition}
                    id={idea.id}
                  />
                }

                {ideaFiles && !isNilOrError(ideaFiles) &&
                  <FileAttachments files={ideaFiles} />
                }

                <StyledOfficialFeedback
                  ideaId={idea.id}
                />

                <StyledComments ideaId={idea.id} />
              </Left>
              <Right>
                <VotePreview ideaId={idea.id}/>

                {idea.attributes.budget && !isNilOrError(tenant) &&
                  <>
                    <BudgetBox>
                      <FormattedNumber
                        value={idea.attributes.budget}
                        style="currency"
                        currency={tenant.attributes.settings.core.currency}
                        minimumFractionDigits={0}
                        maximumFractionDigits={0}
                      />
                      <Picks>
                        <FormattedMessage {...messages.picks} values={{ picksNumber: idea.attributes.baskets_count }} />
                        &nbsp;
                        <InfoTooltip {...messages.basketsCountTooltip} size="small" position="top-left" />
                      </Picks>
                    </BudgetBox>
                  </>
                }

                <IdeaSettings ideaId={idea.id}/>
              </Right>
            </Row>
          </Content>
        </Container>
      );
    }
    return null;
  }
}

const Data = adopt<DataProps, InputProps>({
  idea: ({ ideaId, render }) => <GetIdea id={ideaId}>{render}</GetIdea>,
  project: ({ idea, render }) => <GetProject id={get(idea, 'relationships.project.data.id')}>{render}</GetProject>,
  ideaFiles: ({ ideaId, render }) => <GetResourceFiles resourceId={ideaId} resourceType="idea">{render}</GetResourceFiles>,
  ideaImages: ({ ideaId, render }) => <GetIdeaImages ideaId={ideaId}>{render}</GetIdeaImages>,
  tenant: <GetTenant />,
});

const IdeaContentWithHOCs = injectIntl(injectLocalize(IdeaContent));

const WrappedIdeaContent = (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <IdeaContentWithHOCs {...inputProps} {...dataProps} />}
  </Data>
);

export default WrappedIdeaContent;
