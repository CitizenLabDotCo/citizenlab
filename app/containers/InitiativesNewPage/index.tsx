import React from 'react';
import { adopt } from 'react-adopt';
// import { isString, isEmpty } from 'lodash-es';
// import { isNilOrError } from 'utils/helperUtils';

// libraries
// import CSSTransition from 'react-transition-group/CSSTransition';
// import TransitionGroup from 'react-transition-group/TransitionGroup';
import { withRouter, WithRouterProps } from 'react-router';
import clHistory from 'utils/cl-router/history';

// components
import GoBackButton from 'components/UI/GoBackButton';

// services
// import { addInitiative, updateInitiative, IInitiativeAdd } from 'services/initiatives';
// import { addInitiativeFile, deleteInitiativeFile } from 'services/initiativeFiles';
// import { addInitiativeImage, deleteInitiativeImage } from 'services/initiativeImages';
import { IOption, UploadFile } from 'typings';

// resources
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';
import GetTenant, { GetTenantChildProps } from 'resources/GetTenant';

// utils
// import { convertToGeoJson, reverseGeocode } from 'utils/locationTools';

// style
import { media, colors, fontSizes } from 'utils/styleUtils';
import styled from 'styled-components';
import { lighten } from 'polished';

// intl
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';
import ContentContainer from 'components/ContentContainer';
import { get } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';
import T from 'components/T';

const Container = styled.div`
  background: ${colors.background};
  min-height: calc(100vh - ${props => props.theme.menuHeight}px - 1px);
  position: relative;
`;

const TopLine = styled.div`
  width: 100%;
  position: fixed; /* IE11 fallback */
  position: sticky;
  top: ${({ theme }) => theme.menuHeight}px;
  padding: 35px 50px 0;
`;

const Header = styled.div`
  width: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 40px;
  padding-bottom: 90px;
  padding-left: 30px;
  padding-right: 30px;

  ${media.smallerThanMaxTablet`
    padding-top: 50px;
    padding-bottom: 50px;
  `}
`;

const HeaderTitle: any = styled.h1`
  width: 100%;
  max-width: 600px;
  color: ${({ theme }) => theme.colorMain};
  font-size: ${({ theme }) => theme.signedOutHeaderTitleFontSize || (fontSizes.xxxl + 1)}px;
  line-height: normal;
  font-weight: ${({ theme }) => theme.signedOutHeaderTitleFontWeight || 600};
  text-align: center;
  margin: 0;
  padding: 0;

  ${media.smallerThanMaxTablet`
    font-size: ${fontSizes.xxl}px;
  `}
`;

const ColoredText = styled.span`
  color: ${({ theme }) => lighten(.3, theme.colorMain)};
`;

const TwoColumns = styled.div`
  display: flex;
  flex-direction: row;
`;

const TipsContainer = styled.div`
  background: ${colors.lightGreyishBlue};
  border-radius: ${({ theme }) => theme.borderRadius};
  color: ${({ theme }) => theme.colorText};
  width: 550px;
  padding: 40px 50px;
`;

const TipsTitle = styled.div`
  margin-bottom: 12px;
  font-size: ${fontSizes.large}px;
  line-height: 24px;
  font-weight: 600;
`;

const SubP = styled.p`
  &:not(:last-child) {
    margin-bottom: 20px;
  }
`;
const FormContainer = styled.div`
  width: 100%;
  margin-right: 25px;
`;

interface InputProps {}

interface DataProps {
  locale: GetLocaleChildProps;
  authUser: GetAuthUserChildProps;
  tenant: GetTenantChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {
  publishing: boolean;
  title: string | null;
  description: string | null;
  selectedTopics: IOption[] | null;
  budget: number | null;
  position: string;
  position_coordinates: GeoJSON.Point | null;
  submitError: boolean;
  processing: boolean;
  ideaId: string | null;
  ideaSlug: string | null;
  imageFile: UploadFile[];
  imageId: string | null;
  imageChanged: boolean;
  ideaFiles: UploadFile[];
  ideaFilesToRemove: UploadFile[];
}

class InitiativesNewPage extends React.PureComponent<Props & WithRouterProps, State> {
  constructor(props) {
    super(props);

    this.state = {
      publishing: false,
      title: null,
      description: null,
      selectedTopics: null,
      budget: null,
      position: '',
      position_coordinates: null,
      submitError: false,
      processing: false,
      ideaId: null,
      ideaSlug: null,
      imageFile: [],
      imageId: null,
      imageChanged: false,
      ideaFiles: [],
      ideaFilesToRemove: []
    };
  }

  componentDidMount() {
    // const { location } = this.props;
    //
    // if (location.query.position) {
    //   reverseGeocode(JSON.parse(location.query.position)).then((position) => {
    //     this.setState({
    //       position,
    //       position_coordinates: {
    //         type: 'Point',
    //         coordinates: JSON.parse(location.query.position) as number[]
    //       }
    //     });
    //   });
    // }
  }

  handleOnIdeaSubmit = async () => {
    // empty
  }

  goBack = () => {
    clHistory.goBack();
  }

  render() {
    const { tenant } = this.props;

    if (isNilOrError(tenant)) return null;

    const eligibilityCriteriaMultiloc = get(tenant, 'attributes.settings.initiatives.eligibility_criteria');

    return (
      <Container className="e2e-initiatives-form-page">
        <TopLine>
          <GoBackButton onClick={this.goBack} />
        </TopLine>
        <Header>
          <HeaderTitle>
            <FormattedMessage
              {...messages.header}
              values={{ styledOrgName: <ColoredText><FormattedMessage {...messages.orgName} /></ColoredText> }}
            />
          </HeaderTitle>
        </Header>
        <ContentContainer mode="page">
          <TwoColumns>
            <FormContainer>
              I've got a tip for you
            </FormContainer>
            <TipsContainer>
              <TipsTitle>
                <FormattedMessage {...messages.tipsTitle} />
              </TipsTitle>
              <p>
                <FormattedMessage {...messages.tipsExplanation} />
              </p>
              <SubP>
                <FormattedMessage {...messages.requirmentsListTitle} />
                <ul>
                  <li>
                    <FormattedMessage
                      {...messages.requirmentVoteTreshold}
                      values={{
                        voteThreshold: get(tenant, 'attributes.settings.initiatives.voting_threshold'),
                      }}
                    />
                  </li>
                  <li>
                    <FormattedMessage
                      {...messages.requirmentDaysLimit}
                      values={{
                        daysLimit: get(tenant, 'attributes.settings.initiatives.days_limit'),
                      }}
                    />
                  </li>
                </ul>
              </SubP>
              {eligibilityCriteriaMultiloc &&
                <>
                  <p>
                    <FormattedMessage {...messages.eligibility} />
                  </p>
                  <SubP>
                    <T value={eligibilityCriteriaMultiloc}/>
                  </SubP>
                </>
              }
            </TipsContainer>
          </TwoColumns>
        </ContentContainer>
      </Container>
    );
  }
}

const Data = adopt<DataProps,  InputProps & WithRouterProps>({
  locale: <GetLocale />,
  authUser: <GetAuthUser />,
  tenant: <GetTenant/>
});

export default withRouter((inputProps: InputProps & WithRouterProps) => (
  <Data {...inputProps}>
    {dataProps => <InitiativesNewPage {...inputProps} {...dataProps} />}
  </Data>
));
