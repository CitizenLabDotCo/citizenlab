import React from 'react';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';

// components
import Fragment from 'components/Fragment';
import Sharing from 'components/Sharing';

// resources
import GetProjectFolder, { GetProjectFolderChildProps } from 'resources/GetProjectFolder';
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';

// i18n
import T from 'components/T';
import messages from './messages';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';

// style
import styled, { withTheme } from 'styled-components';
import { media } from 'utils/styleUtils';
import { ScreenReaderOnly } from 'utils/a11y';
import QuillEditedContent from 'components/UI/QuillEditedContent';

const Container = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-top: 50px;
  margin-bottom: 100px;

  ${media.smallerThanMinTablet`
    flex-direction: column;
    justify-content: flex-start;
    margin-top: 20px;
    margin-bottom: 80px;
  `}
`;

const Left = styled.div`
  flex: 1;
  padding: 0;
  margin: 0;
`;

const Right = styled.div`
  width: 100%;
  max-width: 340px;
  margin-left: 70px;

  ${media.smallerThanMinTablet`
    flex: 1;
    width: 100%;
    max-width: 100%;
    margin-left: 0;
    margin-top: 20px;
  `}
`;

const Description = styled.div`
  ${media.smallerThanMinTablet`
    margin-bottom: 20px;
  `}
`;

interface InputProps {
  projectFolderId: string;
}

interface DataProps {
  projectFolder: GetProjectFolderChildProps;
  authUser: GetAuthUserChildProps;
}

interface Props extends InputProps, DataProps {
  theme: any;
}

const ProjectFolderInfo = (props: Props & InjectedIntlProps) => {
  const { projectFolder, theme, intl: { formatMessage }, authUser } = props;
  const folderUrl = location.href;
  const utmParams = authUser ? {
    source:'share_project',
    campaign:'share_content',
    content: authUser.id
  } : {
    source:'share_project',
    campaign:'share_content'
  };

  if (!isNilOrError(projectFolder)) {
    return (
      <Container>
        <ScreenReaderOnly>
          <FormattedMessage tagName="h2" {...messages.invisibleTitleMainContent} />
        </ScreenReaderOnly>
        <Left>
          <Description>
            <QuillEditedContent textColor={theme.colorText}>
              <T value={projectFolder.attributes.description_multiloc} supportHtml={true}/>
            </QuillEditedContent>
          </Description>
        </Left>

        <Right>
          <T value={projectFolder.attributes.title_multiloc} maxLength={50} >
            {(title) => {
              return (
                <Sharing
                  context="project"
                  url={folderUrl}
                  titleLevel="h2"
                  twitterMessage={formatMessage(messages.twitterMessage, { title })}
                  utmParams={utmParams}
                />);
            }}
          </T>
        </Right>
      </Container>
    );
  }

  return null;
};

const ProjectFolderInfoWhithHoc = withTheme(injectIntl<Props>(ProjectFolderInfo));

const Data = adopt<DataProps, InputProps>({
  projectFolder: ({ projectFolderId, render }) => <GetProjectFolder projectFolderId={projectFolderId}>{render}</GetProjectFolder>,
  authUser: ({ render }) => <GetAuthUser>{render}</GetAuthUser>,
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => {
      if (!isNilOrError(dataProps.projectFolder)) {
        return (
          <ProjectFolderInfoWhithHoc
            {...inputProps}
            {...dataProps}
          />
        );
      }

      return null;
    }}
  </Data>
);
