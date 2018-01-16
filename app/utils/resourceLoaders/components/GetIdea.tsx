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

  componentWillMount() {
    this.updateSub(this.props);
  }

  componentWillReceiveProps(newProps) {
    if ((newProps.id !== this.props.id) || (newProps.slug !== this.props.slug)) {
      this.updateSub(newProps);
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
