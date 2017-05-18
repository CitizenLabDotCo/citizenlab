import React from 'react';
import PropTypes from 'prop-types';
import { BarChart, Bar, XAxis, YAxis } from 'recharts';

export const BarChartWrapper = ({ data, layout }) => (
  <BarChart
    width={730}
    // TODO: optimize the height for best rendering
    height={30 * data.length}
    style={{ border: '1px solid #8884d8' }}
    data={data}
    layout={layout}
  >
    <Bar dataKey="value" fill="#8884d8" />
    <XAxis dataKey="value" type="number" height={1} hide />
    <YAxis dataKey="label" type="category" width={100} />
  </BarChart>
);

BarChartWrapper.propTypes = {
  data: PropTypes.array.isRequired,
  layout: PropTypes.string.isRequired,
};
