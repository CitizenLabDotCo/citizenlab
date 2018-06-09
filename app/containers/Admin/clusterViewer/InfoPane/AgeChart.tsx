import React, { Component } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ReferenceLine } from 'recharts';

class GenderChart extends Component {

  processedData = () => {
    return [
      { label: 'male', upvotes: 10, downvotes: -3 },
      { label: 'female', upvotes: 7, downvotes: -1 },
      { label: 'unspecified', upvotes: 1, downvotes: -1 },
      { label: 'blank', upvotes: 5, downvotes: -2 },
    ];
  }

  render() {
    return (
      <div>
        <BarChart
          width={400}
          height={250}
          data={this.processedData()}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          stackOffset="sign"
        >
          <XAxis dataKey="label" />
          <YAxis />
          <Tooltip />
          <Legend />
          <ReferenceLine y={0} stroke="#000" />
          <Bar dataKey="upvotes" fill="green" stackId="votes" maxBarSize={20} />
          <Bar dataKey="downvotes" fill="red" stackId="votes" maxBarSize={20} />
        </BarChart>
      </div>
    );
  }
}

export default GenderChart;
