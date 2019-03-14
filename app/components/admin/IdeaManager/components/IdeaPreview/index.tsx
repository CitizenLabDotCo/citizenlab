import React, { PureComponent } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { adopt } from 'react-adopt';

// components
import Icon from 'components/UI/Icon';
import MoreActionsMenu, { IAction } from 'components/UI/MoreActionsMenu';
import Modal from 'components/UI/Modal';
import UserName from 'components/UI/UserName';
import FileAttachments from 'components/UI/FileAttachments';
import Button from 'components/UI/Button';
import Fragment from 'components/Fragment';
import FeatureFlag from 'components/FeatureFlag';
import HasPermission from 'components/HasPermission';
import Spinner, { ExtraProps as SpinnerProps } from 'components/UI/Spinner';
import Avatar from 'components/Avatar';
import StatusBadge from 'components/StatusBadge';
import Sharing from 'components/Sharing';
import VoteControl from 'components/VoteControl';
import SpamReportForm from 'containers/SpamReport';
import Comments from 'containers/IdeasShow/CommentsContainer';
import IdeaMap from 'containers/IdeasShow/IdeaMap';
import Activities from 'containers/IdeasShow/Activities';
import VoteWrapper from 'containers/IdeasShow/VoteWrapper';
import AssignBudgetWrapper from 'containers/IdeasShow/AssignBudgetWrapper';
import ParentCommentForm from 'containers/IdeasShow/ParentCommentForm';
import IdeaSharingModalContent from 'containers/IdeasShow/IdeaSharingModalContent';
import OfficialFeedback from 'containers/IdeasShow/OfficialFeedback';

// utils
import { pastPresentOrFuture } from 'utils/dateUtils';

// resources
import GetResourceFiles, { GetResourceFilesChildProps } from 'resources/GetResourceFiles';
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';
import GetTenantLocales, { GetTenantLocalesChildProps } from 'resources/GetTenantLocales';
import GetMachineTranslation from 'resources/GetMachineTranslation';

// i18n
import T from 'components/T';
import { FormattedRelative, InjectedIntlProps } from 'react-intl';
import { FormattedMessage } from 'utils/cl-intl';
import injectIntl from 'utils/cl-intl/injectIntl';
import messages from './messages';
import { getLocalized } from 'utils/i18n';

// animations
import CSSTransition from 'react-transition-group/CSSTransition';

// style
import styled from 'styled-components';
import { media, colors, fontSizes } from 'utils/styleUtils';
import { darken, lighten } from 'polished';
import QuillEditedContent from 'components/UI/QuillEditedContent';
import GetIdea, { GetIdeaChildProps } from 'resources/GetIdea';

const Container = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
  position: relative;
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

class IdeaPreview extends PureComponent<Props & InjectedIntlProps, State> {
  render() {
    const { title_multiloc, body_multiloc } = this.props.idea.attributes;
    if (!isNilOrError(idea)) {
      return (
        <Container>
          <Left>
            <T value={title_multiloc} />
          </Left>
          <Right>
            "Hahahaahaaaaa"
          </Right>
        </Container>
      );
    }
    return null;
  }
}

const IdeaPreviewWithHOCs = injectIntl(IdeaPreview);

const Data = adopt<DataProps, InputProps>({
  idea: ({ ideaId, render }) => <GetIdea id={ideaId}>{render}</GetIdea>,
  ideaFiles: ({ ideaId, render }) => <GetResourceFiles resourceId={ideaId} resourceType="idea">{render}</GetResourceFiles>,
  locale: <GetLocale />,
  tenantLocales: <GetTenantLocales />,
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <IdeaPreviewWithHOCs {...inputProps} {...dataProps} />}
  </Data>
);
