import React from 'react';
import { adopt } from 'react-adopt';
// style
import styled from 'styled-components';
import { isError } from 'lodash-es';
// resources
import GetInitiative, {
  GetInitiativeChildProps,
} from 'resources/GetInitiative';
// hooks
import useFeatureFlag from 'hooks/useFeatureFlag';
// i18n
import { FormattedMessage } from 'utils/cl-intl';
import { withRouter, WithRouterProps } from 'utils/cl-router/withRouter';
import { isNilOrError } from 'utils/helperUtils';
import { fontSizes, colors } from 'utils/styleUtils';
import InitiativesShow from 'containers/InitiativesShow';
// components
import PageNotFound from 'components/PageNotFound';
import Button from 'components/UI/Button';
import InitiativeShowPageTopBar from './InitiativeShowPageTopBar';
import messages from './messages';

const InitiativeNotFoundWrapper = styled.div`
  height: calc(
    100vh - ${(props) => props.theme.menuHeight + props.theme.footerHeight}px
  );
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4rem;
  font-size: ${fontSizes.l}px;
  color: ${colors.textSecondary};
`;

const Container = styled.div`
  background: #fff;
`;

const StyledInitiativeShowPageTopBar = styled(InitiativeShowPageTopBar)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
`;

const StyledInitiativesShow = styled(InitiativesShow)``;

interface InputProps {}

interface DataProps {
  initiative: GetInitiativeChildProps;
}

interface Props extends InputProps, DataProps {}

const goBackToListMessage = <FormattedMessage {...messages.goBackToList} />;

const InitiativesShowPage = ({ initiative }: Props) => {
  const initiativesEnabled = useFeatureFlag({ name: 'initiatives' });

  if (isError(initiative)) {
    return (
      <InitiativeNotFoundWrapper>
        <p>
          <FormattedMessage {...messages.noInitiativeFoundHere} />
        </p>
        <Button
          linkTo="/initiatives"
          text={goBackToListMessage}
          icon="arrow-left"
        />
      </InitiativeNotFoundWrapper>
    );
  }

  if (!initiativesEnabled) {
    return <PageNotFound />;
  }

  if (!isNilOrError(initiative)) {
    return (
      <Container>
        <StyledInitiativeShowPageTopBar initiativeId={initiative.id} />
        <StyledInitiativesShow initiativeId={initiative.id} />
      </Container>
    );
  }

  return null;
};

const Data = adopt<DataProps, InputProps & WithRouterProps>({
  initiative: ({ params, render }) => (
    <GetInitiative slug={params.slug}>{render}</GetInitiative>
  ),
});

export default withRouter((inputProps: InputProps & WithRouterProps) => {
  return (
    <Data {...inputProps}>
      {(dataProps) => <InitiativesShowPage {...inputProps} {...dataProps} />}
    </Data>
  );
});
