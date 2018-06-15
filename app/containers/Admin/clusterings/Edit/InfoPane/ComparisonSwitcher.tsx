import React, { PureComponent } from 'react';
import { range } from 'lodash';
import Button from 'components/UI/Button';
import { Label, Icon } from 'semantic-ui-react';

type Props = {
  activeComparison: number;
  comparisonCount: number;
  onChangeActiveComparison: (number) => void;
  onAddComparison: () => void;
  onDeleteComparison: (index: number) => void;
};

type State = {};

const colors: ['yellow', 'purple', 'orange', 'teal'] = ['yellow', 'purple', 'orange', 'teal'];

class ComparisonSwitcher extends PureComponent<Props, State> {

  handleSelectComparison = (i) => () => {
    this.props.onChangeActiveComparison(i);
  }

  handleAddComparison = () => {
    this.props.onAddComparison();
  }

  handleDeleteComparison = (i) => (event) => {
    event.preventDefault();
    event.stopPropagation();
    this.props.onDeleteComparison(i);
  }

  compareLink = () => (
    <div>
      <Button style="text" onClick={this.handleAddComparison}>Compare</Button>
    </div>
  )

  render() {
    const { comparisonCount, activeComparison } = this.props;

    if (comparisonCount === 1) {
      return this.compareLink();
    } else {
      return (
        <div>
          {range(comparisonCount).map((i) => (
            <Label
              as="a"
              key={i}
              onClick={this.handleSelectComparison(i)}
              color={colors[i]}
              basic={i !== activeComparison}
            >
              {i + 1}
              <Icon name="delete" onClick={this.handleDeleteComparison(i)} />
            </Label>
          ))}
          {comparisonCount < 4 &&
            <Label
              as="a"
              onClick={this.handleAddComparison}
              basic
            >
              +
            </Label>
          }
        </div>
      );
    }
  }

}

export default ComparisonSwitcher;
