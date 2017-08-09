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

// Utils
import subscribedComponent from 'utils/subscriptionsDecorator';

// Styles
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
      <div>
        <Button>Add a Phase</Button>

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
                  <td><FormattedMessage {...messages.deletePhaseButton} /></td>
                  <td><Link to={`/admin/projects/${slug}/timeline/${phase.id}`}><FormattedMessage {...messages.editPhaseButton} /></Link></td>
                </tr>
              ))}
            </tbody>
          </PhasesTable>
        }
      </div>
    );
  }
}

export default injectIntl(AdminProjectTimelineIndex);
