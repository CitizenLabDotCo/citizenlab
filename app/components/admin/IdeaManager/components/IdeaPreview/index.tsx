import React, { PureComponent } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { adopt } from 'react-adopt';

// components

// utils

// resources
import GetResourceFiles, { GetResourceFilesChildProps } from 'resources/GetResourceFiles';
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';
import GetTenantLocales, { GetTenantLocalesChildProps } from 'resources/GetTenantLocales';
import GetIdea, { GetIdeaChildProps } from 'resources/GetIdea';

// i18n

// animations
import CSSTransition from 'react-transition-group/CSSTransition';
import styled from 'styled-components';
import T from 'components/T';
import { colors } from 'utils/styleUtils';

// style

const Container = styled.div`
  height: 100%;
  width: 100%;
  position: relative;
`;

const Top = styled.div`
  display: flex;
  height: 50px;
  width: 100%;
  background-color: ${colors.adminBackground};
`;

const Row = styled.div`
  display: flex;
  width: 100%;
  overflow-y: auto;
`;

const Left = styled.div`
  flex: 2;
  margin-right: 50px;
  height: 100%;
`;

const Right = styled.div`
  flex: 1;
`;

interface State {}

interface InputProps {
  ideaId: string | null;
}

interface DataProps {
  idea: GetIdeaChildProps;
}

interface Props extends InputProps, DataProps {}

class IdeaPreview extends PureComponent<Props, State> {
  render() {
    const { idea } = this.props;
    if (!isNilOrError(idea)) {
      return (
        <Container>
          <Top>
            <button>edit</button>
            <button>mark as spam</button>
            <button>delete</button>
          </Top>
          <Row>
            <Left>
              <T value={idea.attributes.title_multiloc} />
            </Left>
            <Right>
              "Hahahaahaaaaa"
            </Right>
          </Row>
        </Container>
      );
    }
    return null;
  }
}

// const IdeaPreviewWithHOCs = injectIntl(IdeaPreview);

const Data = adopt<DataProps, InputProps>({
  idea: ({ ideaId, render }) => <GetIdea id={ideaId}>{render}</GetIdea>,
  ideaFiles: ({ ideaId, render }) => <GetResourceFiles resourceId={ideaId} resourceType="idea">{render}</GetResourceFiles>,
  locale: <GetLocale />,
  tenantLocales: <GetTenantLocales />,
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <IdeaPreview {...inputProps} {...dataProps} />}
  </Data>
);
