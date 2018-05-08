// Libraries
import React from 'react';
import styled from 'styled-components';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';
import { isNullOrError } from 'utils/helperUtils';
import * as moment from 'moment';
import { adopt } from 'react-adopt';
import { withRouter, WithRouterProps } from 'react-router';

// Services
import { deletePhase } from 'services/phases';

// Resources
import GetPhases, { GetPhasesChildProps } from 'resources/GetPhases';

// Components
import T from 'components/T';
import Button from 'components/UI/Button';
import { List, Row, HeadRow } from 'components/admin/ResourceList';

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
  font-size: 16px;
  font-weight: 400;
  line-height: 3rem;
  text-align: center;
  width: 3rem;
  flex: 0 0 3rem;

  &.current {
    background: #32B67A;
  }

  &.past {
    background: #E5E5E5;
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

class AdminProjectTimelineIndex extends React.Component<Props & WithRouterProps & InjectedIntlProps, State> {

  createDeleteClickHandler = (phaseId: string) => (event: React.FormEvent<any>) => {
    event.preventDefault();

    if (window.confirm(this.props.intl.formatMessage(messages.deletePhaseConfirmation))) {
      deletePhase(phaseId);
    }
  }

  phaseTiming = (startIsoDate: string, endIsoDate: string): 'past' | 'current' | 'future' => {
    const currentIsoDate = moment().format('YYYY-MM-DD');

    if (moment(currentIsoDate).isBetween(startIsoDate, endIsoDate, 'days', '[]')) {
      return 'current';
    } else if (moment(startIsoDate).isAfter(currentIsoDate)) {
      return 'future';
    } else {
      return 'past';
    }
  }

  render() {
    const { phases } = this.props;
    const { projectId } = this.props.params;

    return (
      <ListWrapper>
        <AddButton className="e2e-add-phase-button" icon="plus-circle" style="cl-blue" circularCorners={false} linkTo={`/admin/projects/${projectId}/timeline/new`}>
          <FormattedMessage {...messages.addPhaseButton} />
        </AddButton>

        {!isNullOrError(phases) && phases.length > 0 &&
          <div className={`e2e-phases-table`}>
            <StyledList>
              <HeadRow>
                <OrderHeader><FormattedMessage {...messages.orderColumnTitle} /></OrderHeader>
                <div className="expand"><FormattedMessage {...messages.nameColumnTitle} /></div>
              </HeadRow>

              {phases.map((phase, index) => {
                const startAtIsoDate = moment(phase.attributes.start_at).format('YYYY-MM-DD');
                const startAt = moment(phase.attributes.start_at).format('LL');
                const endAtIsoDate = moment(phase.attributes.end_at).format('YYYY-MM-DD');
                const endAt = moment(phase.attributes.end_at).format('LL');

                return (
                  <Row className={`e2e-phase-line ${phases.length === index + 1 ? 'last' : ''}`} id={`e2e-phase_${phase.id}`} key={phase.id}>
                    <OrderLabel className={this.phaseTiming(startAtIsoDate, endAtIsoDate)}>
                      {index + 1}
                    </OrderLabel>
                    <div className="expand">
                      <h1 className="e2e-phase-title"><T value={phase.attributes.title_multiloc} /></h1>
                      <p>{startAt}  →  {endAt}</p>
                    </div>
                    <Button className="e2e-delete-phase" icon="delete" style="text" onClick={this.createDeleteClickHandler(phase.id)}>
                      <FormattedMessage {...messages.deletePhaseButton} />
                    </Button>
                    <Button  circularCorners={false} className="e2e-edit-phase" icon="edit" style="secondary" linkTo={`/admin/projects/${projectId}/timeline/${phase.id}`}>
                      <FormattedMessage {...messages.editPhaseButton} />
                    </Button>
                  </Row>
                );
              })}
            </StyledList>
          </div>
        }
      </ListWrapper>
    );
  }
}

const Data = adopt<DataProps, InputProps & WithRouterProps & InjectedIntlProps>({
  phases: ({ params, render }) => <GetPhases projectId={params.projectId} resetOnChange>{render}</GetPhases>
});

const AdminProjectTimelineIndexWithHoCs = withRouter(injectIntl(AdminProjectTimelineIndex));

export default (inputProps: InputProps & WithRouterProps & InjectedIntlProps) => (
  <Data {...inputProps}>
    {dataProps => <AdminProjectTimelineIndexWithHoCs {...inputProps} {...dataProps} />}
  </Data>
);
