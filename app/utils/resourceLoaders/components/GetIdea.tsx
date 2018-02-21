// Libs
import React from 'react';
import { Subscription } from 'rxjs';

// Services & utils
import { IIdeaData, ideaByIdStream, ideaBySlugStream, IIdea } from 'services/ideas';

// Typing
interface Props {
  id?: string;
  slug?: string;
  children: {(state: State): any};
}

interface State {
  idea: IIdeaData | null;
}

export default class GetIdea extends React.PureComponent<Props, State> {
  private ideaSub: Subscription;

  constructor(props: Props) {
    super(props);

    this.state = {
      idea: null
    };
  }

  componentDidMount() {
    this.updateSub(this.props);
  }

  componentDidUpdate(prevProps: Props) {
    if ((this.props.id !== prevProps.id) || (this.props.slug !== prevProps.slug)) {
      this.updateSub(this.props);
    }
  }

  componentWillUnmount() {
    this.ideaSub.unsubscribe();
  }

  updateSub(props: Props) {
    if (this.ideaSub) this.ideaSub.unsubscribe();

    let targetStream;
    if (props.id) targetStream = ideaByIdStream(props.id);
    if (props.slug) targetStream = ideaBySlugStream(props.slug);

    if (!targetStream) return;

    this.ideaSub = targetStream.observable
    .subscribe((response: IIdea) => {
      this.setState({
        idea: response.data
      });
    });
  }

  render() {
    return this.props.children(this.state);
  }
}
