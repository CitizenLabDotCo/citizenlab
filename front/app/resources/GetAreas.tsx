import React from 'react';
import { Subscription } from 'rxjs';
import { areasStream, IAreaData, IAreasQueryParams } from 'services/areas';
import { isNilOrError } from 'utils/helperUtils';

interface InputProps {}

type children = (renderProps: GetAreasChildProps) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

interface State {
  areas: IAreaData[] | undefined | null | Error;
}

export type GetAreasChildProps = IAreaData[] | undefined | null | Error;

export default class GetAreas extends React.Component<Props, State> {
  defaultQueryParameters: IAreasQueryParams;
  private subscriptions: Subscription[];

  constructor(props: Props) {
    super(props);
    this.state = {
      areas: undefined,
    };

    this.defaultQueryParameters = {
      'page[number]': 1 as number,
      'page[size]': 5000 as number,
    };
  }

  componentDidMount() {
    this.subscriptions = [
      areasStream({
        queryParameters: this.defaultQueryParameters,
      }).observable.subscribe((areas) =>
        this.setState({ areas: !isNilOrError(areas) ? areas.data : areas })
      ),
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  render() {
    const { children } = this.props;
    const { areas } = this.state;
    return (children as children)(areas);
  }
}
