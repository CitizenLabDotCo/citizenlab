// Libraries
import * as React from 'react';
import * as Rx from 'rxjs/Rx';
import styled from 'styled-components';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';
import messages from './messages';

// Services
import { observeProject } from 'services/projects';
import { observePhases, IPhaseData } from 'services/phases';

// Components
import { Link } from 'react-router';
import T from 'utils/containers/t';
import Button from 'components/UI/Button';
import Icon from 'components/UI/Icon';

// Utils
import subscribedComponent from 'utils/subscriptionsDecorator';

// Styles
const ListWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const AddButton = styled(Button)`
  align-self: flex-end;
`;

const PhasesTable = styled.table`
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
  display: flex;
  padding: .75rem 1rem;

  svg {
    flex: 1 0 1rem;
    margin-right: 1rem;
  }

  span {
    display: block;
    flex: 1 0 auto;
  }
`;

const EditButton = styled(Link as React.StatelessComponent<{to: string}>)`
  background: #e5e5e5;
  border-radius: 5px;
  color: #6B6B6B;
  display: flex;
  padding: .75rem 1rem;

  svg {
    flex: 1 0 1rem;
    margin-right: 1rem;
  }

  span {
    display: block;
    flex: 1 0 auto;
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
    this.subscription = observeProject(this.props.params.slug).observable
    .switchMap((project) => {
      return observePhases(project.data.id).observable.map((phases) => (phases.data));
    })
    .subscribe((phases) => {
      this.setState({ phases, loading: false });
    });
  }

  handleDeleteClick = (event) => {
    event.preventDefault();
    const id = event.target.dataset.phaseid;

    if (window.confirm(this.props.intl.formatMessage(messages.deletePhaseConfirmation))) {
      console.log(`Delete phase ${id}`);
    }
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
        <AddButton>Add a Phase</AddButton>

        {!loading && phases &&
          <PhasesTable>
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
                <tr key={phase.id}>
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
                    <DeleteButton data-phaseid={phase.id} onClick={this.handleDeleteClick}>
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
