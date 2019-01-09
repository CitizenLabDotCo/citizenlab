import React from 'react';
import { Subscription } from 'rxjs';
import { IMinimalIdeaData, similarIdeas } from 'services/ideas';
import { isNilOrError } from 'utils/helperUtils';

interface InputProps {
  ideaId: string;
  pageSize?: number;
}

type children = (renderProps: GetSimilarIdeasChildProps) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

interface State {
  ideas: IMinimalIdeaData[] | undefined | null | Error;
}

export type GetSimilarIdeasChildProps = IMinimalIdeaData[] | undefined | null | Error;

export default class GetAreas extends React.Component<Props, State> {
  private subscriptions: Subscription[];

  constructor(props: Props) {
    super(props);
    this.state = {
      ideas: undefined
    };
  }

  componentDidMount() {
    this.subscriptions = [
      similarIdeas(this.props.ideaId, { queryParameters: {
        'page[size]': this.props.pageSize || 5,
      }})
        .observable
        .subscribe(ideas => {
          this.setState({ ideas: !isNilOrError(ideas) ? ideas.data : ideas });
        })
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  render() {
    const { children } = this.props;
    const { ideas } = this.state;
    return (children as children)(ideas);
  }
}
