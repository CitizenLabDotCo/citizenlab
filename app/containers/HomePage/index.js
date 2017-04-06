/*
 * HomePage
 *
 * This is the first thing users see of our App, at the '/' route
 *
 * NOTE: while this component should technically be a stateless functional
 * component (SFC), hot reloading does not currently support SFCs. If hot
 * reloading is not a necessity for you then you can refactor it and remove
 * the linting exception.
 */

// TODO enable eslint
/* eslint-disable */
import React from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { makeSelectCurrentTenant } from 'utils/tenant/selectors';
import TopicSelect from 'components/TopicSelect';
import { Reveal } from 'components/Foundation';
import T from 'containers/T';
import messages from './messages';

const topics = [
  { value: 'one', label: 'one' },
  { value: 'two', label: 'two' },
  { value: 'three', label: 'three' },
  { value: 'four', label: 'four' },
];

const titleMultiloc = {
  en: 'Hello',
  nl: 'Hallo',
  fr: 'Bonjour',
};

export class HomePage extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    currentTenant: React.PropTypes.any,
  };

  render() {
    let modalInstance = null;
    const currentTenant = this.props.currentTenant;
    return (
      <div className="cl-home-page">
        <h1>
          <FormattedMessage {...messages.header} />
        </h1>

        <p>CurrentTenant: { currentTenant ? currentTenant.attributes.name : 'null' }</p>

        <h3>Topic Select Demo</h3>
        <TopicSelect options={topics} />

        <br /><br />
        <h3>Multiloc Demo</h3>
        <T value={titleMultiloc} />


        <br /><br />
        <h3>Modal demo</h3>
        <a onClick={() => modalInstance.instance.open()}>Open modal</a>

        <Reveal
          id="helloModal"
          data-overlay="false"
          data-animation-in="slide-in-right"
          data-animation-out="slide-out-right"
          ref={ref => modalInstance = ref }
        >
          <div>
            My name is Reveal. I am a Foundation modal.
          </div>
        </Reveal>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  currentTenant: makeSelectCurrentTenant()(state),
});

export default connect(mapStateToProps)(HomePage);
