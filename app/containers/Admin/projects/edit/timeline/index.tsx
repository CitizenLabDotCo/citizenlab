// Libraries
import * as React from 'react';
import * as Rx from 'rxjs/Rx';
import styled from 'styled-components';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';
import messages from './messages';
import * as _ from 'lodash';

// Services
import { projectBySlugStream } from 'services/projects';
import { phasesStream, IPhaseData, deletePhase } from 'services/phases';

// Components
import { Link } from 'react-router';
import T from 'components/T';
import Button from 'components/UI/Button';
import Icon from 'components/UI/Icon';
import buttonMixin from 'components/admin/StyleMixins/buttonMixin';

// Utils
import subscribedComponent from 'utils/subscriptionsDecorator';

// Styles
const ListWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const AddButton = styled(Link)`
  ${buttonMixin('#EF0071', '#EF0071')}
  color: #fff;
  align-self: flex-end;

  &:hover,
  &:focus {
    color: #fff;
  }
`;

const PhasesTable = styled.table`
  width: 100%;

  th {
    font-weight: normal;
    text-align: left;
    padding: .5rem;
  }

  td {
    border-bottom: 1px solid #eaeaea;
    border-top: 1px solid #eaeaea;
    padding: 2rem .5rem;
  }

  h1 {
    font-weight: normal;
    margin-bottom: 0;
  }
`;

const OrderLabel = styled.div`
  border-radius: 50%;
  color: white;
  height: 3rem;
  line-height: 3rem;
  text-align: center;
  width: 3rem;

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

const DeleteButton = styled.button`
  ${buttonMixin()}
`;

const EditButton = styled(Link)`
  ${buttonMixin('#e5e5e5', '#cccccc')}
  color: #6B6B6B;

  &:hover,
  &:focus: {
    color: #6B6B6B;
  }
`;

// Component typing
type Props = {
  intl: ReactIntl.InjectedIntl,
  params: {
    slug: string | null,
  },
};

type State = {
  phases: IPhaseData[],
  loading: boolean,
};

@subscribedComponent
class AdminProjectTimelineIndex extends React.Component<Props, State> {
  subscription: Rx.Subscription;
  constructor () {
    super();

    this.state = {
      phases: [],
      loading: false,
    };
  }

  componentDidMount () {
    this.setState({ loading: true });

    if (_.isString(this.props.params.slug)) {
      this.subscription = projectBySlugStream(this.props.params.slug).observable.switchMap((project) => {
        return phasesStream(project.data.id).observable.map((phases) => (phases.data));
      }).subscribe((phases) => {
        this.setState({ phases, loading: false });
      });
    }
  }

  componentWillUnmount() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  createDeleteClickHandler = (phaseId) => {
    return (event) => {
      event.preventDefault();
      if (window.confirm(this.props.intl.formatMessage(messages.deletePhaseConfirmation))) {
        deletePhase(phaseId).then((response) => {
          this.setState({ phases: _.reject(this.state.phases, { id: phaseId }) });
        });
      }
    };
  }

  phaseTiming = ({ start_at, end_at }): 'past' | 'current' | 'future' => {
    const start = new Date(start_at);
    const end = new Date(end_at);
    const now = new Date();

    if (end < now) {
      return 'past';
    } else if (start > now) {
      return 'future';
    } else {
      return 'current';
    }
  }

  render() {
    const { phases, loading } = this.state;
    const { intl: { formatDate }, params: { slug } } = this.props;

    return (
      <ListWrapper>
        <AddButton className="e2e-add-phase-button" to={`/admin/projects/${slug}/timeline/new`}><FormattedMessage {...messages.addPhaseButton} /></AddButton>

        {!loading && phases.length > 0 &&
          <PhasesTable className="e2e-phases-table">
            <thead>
              <tr>
                <th><FormattedMessage {...messages.orderColumnTitle} /></th>
                <th><FormattedMessage {...messages.nameColumnTitle} /></th>
                <th />
                <th />
              </tr>
            </thead>
            <tbody>
              {phases.map((phase, index) => (
                <tr className="e2e-phase-line" id={`e2e-phase_${phase.id}`} key={phase.id}>
                  <td>
                    <OrderLabel className={this.phaseTiming({ start_at: phase.attributes.start_at, end_at: phase.attributes.end_at })}>
                      {index + 1}
                    </OrderLabel>
                  </td>
                  <td>
                    <h1><T value={phase.attributes.title_multiloc} /></h1>
                    <p>{formatDate(phase.attributes.start_at)} - {formatDate(phase.attributes.end_at)}</p>
                  </td>
                  <td>
                    <DeleteButton onClick={this.createDeleteClickHandler(phase.id)}>
                      <Icon name="delete" />
                      <FormattedMessage {...messages.deletePhaseButton} />
                    </DeleteButton>
                  </td>
                  <td>
                    <EditButton to={`/admin/projects/${slug}/timeline/${phase.id}`}>
                      <Icon name="edit" />
                      <FormattedMessage {...messages.editPhaseButton} />
                    </EditButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </PhasesTable>
        }
      </ListWrapper>
    );
  }
}

export default injectIntl(AdminProjectTimelineIndex);
