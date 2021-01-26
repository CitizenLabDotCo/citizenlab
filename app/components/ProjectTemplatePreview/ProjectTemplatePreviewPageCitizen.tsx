import React, { memo } from 'react';
import { adopt } from 'react-adopt';
import { get } from 'lodash-es';
import { withRouter, WithRouterProps } from 'react-router';
import clHistory from 'utils/cl-router/history';

// components
import ProjectTemplatePreview from './ProjectTemplatePreview';
import { Icon } from 'cl2-component-library';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { isAdmin } from 'services/permissions/roles';

// resources
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// styling
import styled from 'styled-components';
import { colors, media, fontSizes } from 'utils/styleUtils';
import { darken } from 'polished';

const Container = styled.div`
  width: 100%;
  min-height: calc(
    100vh - ${(props) => props.theme.menuHeight + props.theme.footerHeight}px
  );
  display: flex;
  justify-content: center;
  padding: 50px;
  background: ${colors.background};

  ${media.smallerThanMaxTablet`
    min-height: calc(100vh - ${(props) => props.theme.mobileMenuHeight}px - ${(
    props
  ) => props.theme.mobileTopBarHeight}px);
  `}

  ${media.smallerThanMinTablet`
    padding: 20px;
  `}
`;

const ContainerInner = styled.div`
  width: 100%;
  max-width: 1050px;
  min-height: calc(
    100vh - ${(props) => props.theme.menuHeight + props.theme.footerHeight}px
  );
  display: flex;
  flex-direction: column;
  align-items: stretch;
`;

const InfoboxContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 27px;
  margin-bottom: 25px;
  border-radius: ${(props: any) => props.theme.borderRadius};
  background: ${colors.clBlueDarkBg};
`;

const InfoboxIcon = styled(Icon)`
  flex: 0 0 31px;
  width: 31px;
  height: 31px;
  fill: #80cfd8;
  padding: 0px;
  margin: 0px;
  margin-right: 27px;
`;

const InfoboxText = styled.div`
  color: ${colors.clBlueDarker};
  font-size: ${fontSizes.base}px;
  line-height: 21px;
  font-weight: 400;
  display: flex;
  flex-direction: column;

  p {
    margin: 0;
    padding: 0;
  }

  a {
    color: ${colors.clBlueDarker};
    font-weight: 400;
    text-decoration: underline;

    &:hover {
      color: ${darken(0.15, colors.clBlueDarker)};
      text-decoration: underline;
    }
  }

  strong {
    font-weight: 600;
  }
`;

export interface InputProps {
  projectTemplateId: string;
  className?: string;
}

interface DataProps {
  authUser: GetAuthUserChildProps;
}

interface Props extends InputProps, DataProps {}

const ProjectTemplatePreviewPageCitizen = memo<Props & WithRouterProps>(
  ({ params, className, authUser }) => {
    const projectTemplateId: string | undefined = get(
      params,
      'projectTemplateId'
    );

    if (projectTemplateId) {
      if (!isNilOrError(authUser) && isAdmin({ data: authUser })) {
        clHistory.push(`/admin/projects/templates/${projectTemplateId}`);
      } else {
        const link = (
          // tslint:disable-next-line
          <a href="mailto:support@citizenlab.co" target="_blank">
            <FormattedMessage {...messages.citizenlabExpert} />
          </a>
        );

        return (
          <Container className={className || ''}>
            <ContainerInner>
              <InfoboxContainer className={className}>
                <InfoboxIcon name="key" />
                <InfoboxText>
                  <p>
                    <strong>
                      <FormattedMessage {...messages.infoboxLine1} />
                    </strong>
                  </p>
                  <p>
                    <FormattedMessage
                      {...messages.infoboxLine2}
                      values={{ link }}
                    />
                  </p>
                </InfoboxText>
              </InfoboxContainer>

              <ProjectTemplatePreview projectTemplateId={projectTemplateId} />
            </ContainerInner>
          </Container>
        );
      }
    }

    return null;
  }
);

const ProjectTemplatePreviewPageCitizenWithHoC = withRouter(
  ProjectTemplatePreviewPageCitizen
);

const Data = adopt<DataProps, InputProps>({
  authUser: <GetAuthUser />,
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => (
      <ProjectTemplatePreviewPageCitizenWithHoC
        {...inputProps}
        {...dataProps}
      />
    )}
  </Data>
);
