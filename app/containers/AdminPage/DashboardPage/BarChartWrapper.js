import React from 'react';
import PropTypes from 'prop-types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export const BarChartWrapper = ({ data, layout }) => (
  <BarChart
    width={730}
    height={250}
    data={data}
    layout={layout}
    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
  >
    <XAxis dataKey="name" />
    <YAxis />
    <CartesianGrid strokeDasharray="3 3" />
    <Tooltip />
    <Legend />
    <Bar dataKey="pv" />
    <Bar dataKey="uv" />
  </BarChart>
);

BarChartWrapper.propTypes = {
  data: PropTypes.array.isRequired,
  layout: PropTypes.string.isRequired,
};
