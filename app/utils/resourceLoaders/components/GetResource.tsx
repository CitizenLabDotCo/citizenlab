// Libs
import React from 'react';
import { Subscription } from 'rxjs';
import { IStream } from 'utils/streams';

// Services & utils

interface IStreamFn<IResource> {
  (resourceId: string): IStream<IResource>;
}

// Typing
interface Props<resource, IResourceData> {
  stream: IStreamFn<resource>;
  id: string;
  children: (state: State<IResourceData>) => JSX.Element | null;
}

interface State<IResourceData> {
  resource: IResourceData | null;
}

interface IIResource<IResourceData> {
  data: IResourceData;
}

export default class GetResource<resource extends IIResource<IResourceData>, IResourceData> extends React.PureComponent<Props<resource, IResourceData>, State<IResourceData>> {
  private subscription: Subscription;

  constructor(props) {
    super(props);

    this.state = {
      resource: null
    };
  }

  componentDidMount() {
    this.updateSub();
  }

  componentDidUpdate(prevProps: Props<resource, IResourceData>) {
    if (this.props.id !== prevProps.id) {
      this.updateSub();
    }
  }

  componentWillUnmount() {
    this.subscription.unsubscribe();
  }

  updateSub() {
    if (this.subscription) this.subscription.unsubscribe();


    this.subscription = this.props.stream(this.props.id).observable
      .subscribe((response) => {
        this.setState({
          resource: response.data
        });
      });
  }

  render() {
    return this.props.children(this.state);
  }
}
