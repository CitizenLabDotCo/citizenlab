import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import { observeIdeaStatuses, IIdeaStatusData } from 'services/idea_statuses';
import T from 'containers/T';

type Props = {
  statusId: string,
  color: string,
  statusName: string,
  className?: string,
}

type State = {
  ideaStatus: IIdeaStatusData | null;
}

const Badge = styled.div`
  color: white;
  font-size: 13px;
  border-radius: 3px;
  padding: 3px 8px;
  display: inline-block;
  text-transform: uppercase;
  text-align: center;
  font-weight: 700;
  background-color: ${(props: any) => props.color}
`

export default class Status extends React.Component<Props, State> {

  constructor() {
    super();
    this.state = {
      ideaStatus: null,
    }
  }
  componentDidMount() {
    observeIdeaStatuses()
      .observable
      .subscribe((response) => {
        const ideaStatus = response.data.filter((is) => is.id === this.props.statusId)[0];
        this.setState({
          ideaStatus,
        });
      })
  }
  render() {
    const { statusId, statusName, className } = this.props;
    const { ideaStatus } = this.state;

    const fallbackColor = '#bbbbbb';

    return ideaStatus && (
      <Badge className={className} color={ideaStatus.attributes.color || fallbackColor} >
        <T value={ideaStatus.attributes.title_multiloc} />
      </Badge>
    );
  }
}
