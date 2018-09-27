import React, { PureComponent } from 'react';
import styled from 'styled-components';

import { IDestination } from 'utils/analytics';

const TableScroll = styled('div')`
  overflow-x: auto;
  margin-top: 16px;
`;

const Table = styled('table')`
  border-collapse: collapse;
  font-size: 12px;
`;

const ColumnHeading = styled('th')`
  background: #f7f8fa;
  color: #1f4160;
  font-weight: 600;
  text-align: left;
  border-width: 2px;
`;

const RowHeading = styled('th')`
  font-weight: normal;
  text-align: left;
`;

const Row = styled('tr')`
  th,
  td {
    vertical-align: top;
    padding: 8px 12px;
    border: 1px solid rgba(67, 90, 111, 0.114);
  }
  td {
    border-top: none;
  }
`;

const InputCell = styled('td')`
  input {
    vertical-align: middle;
  }
  label {
    display: block;
    margin-bottom: 4px;
    white-space: nowrap;
  }
`;

interface Props {
  onCancel: () => void;
  onSave: () => void;
  onChange: (category, value) => void;
  marketingDestinations: IDestination[];
  advertisingDestinations: IDestination[];
  functionalDestinations: IDestination[];
  marketingAndAnalytics: Boolean;
  advertising: Boolean;
  functional: Boolean;
}

export default class Preferences extends PureComponent<Props> {
  static displayName = 'Preferences';

  render() {
    const {
      marketingDestinations,
      advertisingDestinations,
      functionalDestinations,
      marketingAndAnalytics,
      advertising,
      functional,
    } = this.props;

    return (
        <TableScroll>
          <Table>
            <thead>
              <Row>
                <ColumnHeading scope="col">Allow</ColumnHeading>
                <ColumnHeading scope="col">Category</ColumnHeading>
                <ColumnHeading scope="col">Purpose</ColumnHeading>
                <ColumnHeading scope="col">
                  Tools
                </ColumnHeading>
              </Row>
            </thead>

            <tbody>
              <Row>
                <InputCell>
                  <label>
                    <input
                      type="radio"
                      name="functional"
                      value="true"
                      checked={functional === true}
                      aria-checked={functional === true}
                      onChange={this.handleChange}
                      aria-label="Allow functional tracking"
                      required
                    />{' '}
                    Yes
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="functional"
                      value="false"
                      checked={functional === false}
                      aria-checked={functional === false}
                      onChange={this.handleChange}
                      aria-label="Disallow functional tracking"
                      required
                    />{' '}
                    No
                  </label>
                </InputCell>
                <RowHeading scope="row">Functional</RowHeading>
                <td>
                  <p>
                    To monitor the performance of our site and to enhance your
                    browsing experience.
                  </p>
                  <p>
                    For example, these tools enable you to communicate with us
                    via live chat.
                  </p>
                </td>
                <td>
                  {functionalDestinations.map(d => d.name).join(', ')}
                </td>
              </Row>

              <Row>
                <InputCell>
                  <label>
                    <input
                      type="radio"
                      name="marketingAndAnalytics"
                      value="true"
                      checked={marketingAndAnalytics === true}
                      aria-checked={marketingAndAnalytics === true}
                      onChange={this.handleChange}
                      aria-label="Allow marketing and analytics tracking"
                      required
                    />{' '}
                    Yes
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="marketingAndAnalytics"
                      value="false"
                      checked={marketingAndAnalytics === false}
                      aria-checked={marketingAndAnalytics === false}
                      onChange={this.handleChange}
                      aria-label="Disallow marketing and analytics tracking"
                      required
                    />{' '}
                    No
                  </label>
                </InputCell>
                <RowHeading scope="row">Marketing and Analytics</RowHeading>
                <td>
                  <p>
                    To understand user behavior in order to provide you with a
                    more relevant browsing experience or personalize the content
                    on our site.
                  </p>
                  <p>
                    For example, we collect information about which pages you
                    visit to help us present more relevant information.
                  </p>
                </td>
                <td>
                  {marketingDestinations.map(d => d.name).join(', ')}
                </td>
              </Row>

              <Row>
                <InputCell>
                  <label>
                    <input
                      type="radio"
                      name="advertising"
                      value="true"
                      checked={advertising === true}
                      aria-checked={advertising === true}
                      onChange={this.handleChange}
                      aria-label="Allow advertising tracking"
                      required
                    />{' '}
                    Yes
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="advertising"
                      value="false"
                      checked={advertising === false}
                      aria-checked={advertising === false}
                      onChange={this.handleChange}
                      aria-label="Disallow advertising tracking"
                      required
                    />{' '}
                    No
                  </label>
                </InputCell>
                <RowHeading scope="row">Advertising</RowHeading>
                <td>
                  <p>
                    To personalize and measure the effectiveness of advertising
                    on our site and other websites.
                  </p>
                  <p>
                    For example, we may serve you a personalized ad based on the
                    pages you visit on our site.
                  </p>
                </td>
                <td>
                  {advertisingDestinations.map(d => d.name).join(', ')}
                </td>
              </Row>

              <Row>
                <td>N/A</td>
                <RowHeading scope="row">Essential</RowHeading>
                <td>
                  <p>
                    We use browser cookies that are necessary for the site to
                    work as intended.
                  </p>
                  <p>
                    For example, we store your website data collection
                    preferences so we can honor them if you return to our site.
                    You can disable these cookies in your browser settings but
                    if you do the site may not work as intended.
                  </p>
                </td>
                <td />
              </Row>
            </tbody>
          </Table>
        </TableScroll>
    );
  }

  handleChange = e => {
    const { onChange } = this.props;

    onChange(e.target.name, e.target.value === 'true');
  }

}
