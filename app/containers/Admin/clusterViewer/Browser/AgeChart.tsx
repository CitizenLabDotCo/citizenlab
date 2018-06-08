import React, { Component } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ReferenceLine } from 'recharts';

class AgeChart extends Component {

  processedData = () => {
    const rawData =  [
      { label: '-20', upvotes: 10, downvotes: 3 },
      { label: '20+', upvotes: 7, downvotes: 1 },
      { label: '30+', upvotes: 1, downvotes: 1 },
      { label: '40+', upvotes: 2, downvotes: 1 },
      { label: '50+', upvotes: 3, downvotes: 2 },
      { label: '60+', upvotes: 1, downvotes: 0 },
      { label: '70+', upvotes: 1, downvotes: 4 },
    ];

      return rawData.map((record) => (
        {
          label: record.label,
          upvotes: record.upvotes,
          downvotes: -record.downvotes,
          sum: record.upvotes - record.downvotes,
        }
      ));
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
          <Bar dataKey="sum" fill="grey" stackId="total" maxBarSize={20} />
        </BarChart>
      </div>
    );
  }
}

export default AgeChart;
