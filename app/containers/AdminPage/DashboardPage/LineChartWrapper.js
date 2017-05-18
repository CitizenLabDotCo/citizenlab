import React from 'react';
import PropTypes from 'prop-types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

export const LineChartWrapper = ({ data }) => (
  <LineChart
    width={730}
    height={500}
    data={data}
    style={{ border: '1px solid #8884d8' }}
  >
    <CartesianGrid strokeDasharray="3 3" />
    <Line type="monotone" dataKey="value" stroke="#8884d8" />
    <XAxis dataKey="label" hide />
    <YAxis dataKey="value" />
    <Tooltip />
  </LineChart>
);

LineChartWrapper.propTypes = {
  data: PropTypes.array.isRequired,
};
