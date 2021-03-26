// Libraries
import React from 'react';
import styled from 'styled-components';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';
import moment from 'moment';
import { withRouter, WithRouterProps } from 'react-router';

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

// Styling
import { fontSizes, colors } from 'utils/styleUtils';

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
    background: ${colors.separation};
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

interface State {}

class AdminProjectTimelineIndex extends React.PureComponent<
  Props & WithRouterProps & InjectedIntlProps,
  State
> {
  createDeleteClickHandler = (projectId: string, phaseId: string) => (
    event: React.FormEvent<any>
  ) => {
    event.preventDefault();

    if (
      window.confirm(
        this.props.intl.formatMessage(messages.deletePhaseConfirmation)
      )
    ) {
      deletePhase(projectId, phaseId);
    }
  };

  render() {
    const { phases } = this.props;
    const { projectId } = this.props.params;

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
                  const startAt = moment(phase.attributes.start_at).format(
                    'LL'
                  );
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
                        <h1 className="e2e-phase-title">
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
                        onClick={this.createDeleteClickHandler(
                          projectId,
                          phase.id
                        )}
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
      </ListWrapper>
    );
  }
}

export default withRouter(
  injectIntl((inputProps: InputProps & WithRouterProps & InjectedIntlProps) => (
    <GetPhases projectId={inputProps.params.projectId}>
      {(phases) => (
        <AdminProjectTimelineIndex {...inputProps} phases={phases} />
      )}
    </GetPhases>
  ))
);
