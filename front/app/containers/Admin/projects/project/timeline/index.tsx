// Libraries
import React, { useState } from 'react';
import styled from 'styled-components';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';
import moment from 'moment';
import { withRouter, WithRouterProps } from 'utils/cl-router/withRouter';

// Utils
import { pastPresentOrFuture } from 'utils/dateUtils';
import { isNilOrError } from 'utils/helperUtils';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';

// Services
import { deletePhase } from 'services/phases';

// Resources
import GetPhases, { GetPhasesChildProps } from 'resources/GetPhases';

// Components
import T from 'components/T';
import Button from 'components/UI/Button';
import { List, Row, HeadRow } from 'components/admin/ResourceList';
import { SectionTitle, SectionDescription } from 'components/admin/Section';
import Modal from 'components/UI/Modal';
import { Box, Title, Text } from '@citizenlab/cl2-component-library';

// Styling
import { fontSizes, colors } from 'utils/styleUtils';

// Hooks
import { useParams } from 'react-router-dom';

// Styles
const ListWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const AddButton = styled(Button)`
  align-self: flex-start;
`;

const StyledList = styled(List)`
  margin-top: 30px;
`;

const OrderHeader = styled.div`
  flex: 0 0 3rem;
`;

const OrderLabel = styled.div`
  border-radius: 50%;
  color: white;
  height: 3rem;
  font-size: ${fontSizes.base}px;
  font-weight: 400;
  line-height: 3rem;
  text-align: center;
  width: 3rem;
  flex: 0 0 3rem;

  &.present {
    background: #32b67a;
  }

  &.past {
    background: ${colors.divider};
  }

  &.future {
    background: #636363;
  }
`;

interface InputProps {}

interface DataProps {
  phases: GetPhasesChildProps;
}

interface Props extends InputProps, DataProps {}

const AdminProjectTimelineIndex = ({
  phases,
  intl: { formatMessage },
}: Props & InjectedIntlProps) => {
  const { projectId } = useParams() as {
    projectId: string;
  };

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPhaseId, setSelectedPhaseId] = useState('');

  const closeModal = () => {
    setShowDeleteModal(false);
  };

  const handleOpenModal = (phaseId: string) => {
    setShowDeleteModal(true);
    setSelectedPhaseId(phaseId);
  };
  const handleDeletePhase = async () => {
    await deletePhase(projectId, selectedPhaseId);
    closeModal();
  };

  return (
    <ListWrapper>
      <SectionTitle>
        <FormattedMessage {...messages.titleTimeline} />
      </SectionTitle>
      <SectionDescription>
        <FormattedMessage {...messages.subtitleTimeline} />
      </SectionDescription>
      <AddButton
        className="e2e-add-phase-button"
        icon="plus-circle"
        buttonStyle="cl-blue"
        linkTo={`/admin/projects/${projectId}/timeline/new`}
      >
        <FormattedMessage {...messages.addPhaseButton} />
      </AddButton>

      {!isNilOrError(phases) && phases.length > 0 && (
        <div className={'e2e-phases-table'}>
          <StyledList>
            <HeadRow>
              <OrderHeader>
                <FormattedMessage {...messages.orderColumnTitle} />
              </OrderHeader>
              <div className="expand">
                <FormattedMessage {...messages.nameColumnTitle} />
              </div>
            </HeadRow>

            <>
              {phases.map((phase, index) => {
                const startAt = moment(phase.attributes.start_at).format('LL');
                const endAt = moment(phase.attributes.end_at).format('LL');

                return (
                  <Row
                    className={`e2e-phase-line ${
                      phases.length === index + 1 ? 'last' : ''
                    }`}
                    id={`e2e-phase_${phase.id}`}
                    key={phase.id}
                  >
                    <OrderLabel
                      className={pastPresentOrFuture([
                        phase.attributes.start_at,
                        phase.attributes.end_at,
                      ])}
                    >
                      {index + 1}
                    </OrderLabel>
                    <div className="expand">
                      <h1>
                        <T value={phase.attributes.title_multiloc} />
                      </h1>
                      <p>
                        {startAt} → {endAt}
                      </p>
                    </div>
                    <Button
                      className="e2e-delete-phase"
                      icon="delete"
                      buttonStyle="text"
                      onClick={() => handleOpenModal(phase.id)}
                    >
                      <FormattedMessage {...messages.deletePhaseButton} />
                    </Button>
                    <Button
                      className="e2e-edit-phase"
                      icon="edit"
                      buttonStyle="secondary"
                      linkTo={`/admin/projects/${projectId}/timeline/${phase.id}`}
                    >
                      <FormattedMessage {...messages.editPhaseButton} />
                    </Button>
                  </Row>
                );
              })}
            </>
          </StyledList>
        </div>
      )}
      <Modal opened={showDeleteModal} close={closeModal}>
        <Box display="flex" flexDirection="column" width="100%" p="20px">
          <Box mb="40px">
            <Title variant="h3" color="primary">
              {formatMessage(messages.deletePhaseConfirmationQuestion)}
            </Title>
            <Text color="primary" fontSize="l">
              <FormattedMessage {...messages.deletePhaseInfo} />
            </Text>
          </Box>
          <Box
            display="flex"
            flexDirection="row"
            width="100%"
            alignItems="center"
          >
            <Button
              icon="delete"
              buttonStyle="delete"
              width="auto"
              mr="20px"
              onClick={handleDeletePhase}
            >
              <FormattedMessage {...messages.deletePhaseButtonText} />
            </Button>
            <Button buttonStyle="secondary" width="auto" onClick={closeModal}>
              <FormattedMessage {...messages.cancelDeletePhaseText} />
            </Button>
          </Box>
        </Box>
      </Modal>
    </ListWrapper>
  );
};

export default withRouter(
  injectIntl((inputProps: InputProps & WithRouterProps & InjectedIntlProps) => (
    <GetPhases projectId={inputProps.params.projectId}>
      {(phases) => (
        <AdminProjectTimelineIndex {...inputProps} phases={phases} />
      )}
    </GetPhases>
  ))
);
