import React, { memo } from 'react';
import { isError } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';
import { withRouter, WithRouterProps } from 'react-router';
import { adopt } from 'react-adopt';

// components
import InitiativesShow from 'containers/InitiativesShow';
import Button from 'components/UI/Button';
import InitiativeShowPageTopBar from './InitiativeShowPageTopBar';

// resources
import GetInitiative, {
  GetInitiativeChildProps,
} from 'resources/GetInitiative';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// style
import styled from 'styled-components';
import { fontSizes, colors } from 'utils/styleUtils';

const InitiativeNotFoundWrapper = styled.div`
  height: calc(
    100vh - ${(props) => props.theme.menuHeight + props.theme.footerHeight}px
  );
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4rem;
  font-size: ${fontSizes.large}px;
  color: ${colors.label};
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

const InitiativesShowPage = memo<Props>(({ initiative }) => {
  if (isError(initiative)) {
    return (
      <InitiativeNotFoundWrapper>
        <p>
          <FormattedMessage {...messages.noInitiativeFoundHere} />
        </p>
        <Button
          linkTo="/initiatives"
          text={goBackToListMessage}
          icon="arrow-back"
        />
      </InitiativeNotFoundWrapper>
    );
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
});

const Data = adopt<DataProps, InputProps & WithRouterProps>({
  initiative: ({ params, render }) => (
    <GetInitiative slug={params.slug}>{render}</GetInitiative>
  ),
});

export default withRouter<InputProps>(
  (inputProps: InputProps & WithRouterProps) => (
    <Data {...inputProps}>
      {(dataProps) => <InitiativesShowPage {...inputProps} {...dataProps} />}
    </Data>
  )
);
