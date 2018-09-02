import * as React from 'react';

type Props = {
  path: string;
  width: number;
  height: number;
};

type State = {};

class WidgetPreview extends React.Component<Props, State> {

  render() {
    const { path, width, height } = this.props;
    return (
      <iframe
        src={`/widgets${path}`}
        width={width}
        height={height}
      />
    );
  }
}

export default WidgetPreview;
