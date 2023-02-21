import React from 'react';
import { isError } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';
import { withRouter, WithRouterProps } from 'utils/cl-router/withRouter';
import { adopt } from 'react-adopt';

// components
import PageNotFound from 'components/PageNotFound';
import InitiativesShow from 'containers/InitiativesShow';
import InitiativeShowPageTopBar from './InitiativeShowPageTopBar';

// resources
import GetInitiative, {
  GetInitiativeChildProps,
} from 'resources/GetInitiative';

// hooks
import useFeatureFlag from 'hooks/useFeatureFlag';

// style
import styled from 'styled-components';

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

const InitiativesShowPage = ({ initiative }: Props) => {
  const initiativesEnabled = useFeatureFlag({ name: 'initiatives' });

  if (!initiativesEnabled || isError(initiative)) {
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
