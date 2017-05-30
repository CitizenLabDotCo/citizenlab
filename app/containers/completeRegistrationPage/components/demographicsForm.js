import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { Grid, Button, Header, Label, Form } from 'semantic-ui-react';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import { createStructuredSelector } from 'reselect';

import { preprocess } from 'utils';

import { injectTFunc } from 'utils/containers/t/utils';

import { selectAuthDomain } from 'utils/auth/selectors';
import { selectResourcesDomain } from 'utils/resources/selectors';

import messages from '../messages';

import RadioInput from 'components/forms/inputs/radio';
import DropdownInput from 'components/forms/inputs/dropdown';

import { updateCurrentUserRequest, completeUserRegistration } from '../actions';

const RenderError = (props) => {
  const { errorMessage } = props;
  if (!errorMessage) return null;
  return (
    <Label basic color={'red'} pointing>{errorMessage.join(', ')}</Label>
  );
};

RenderError.propTypes = {
  errorMessage: React.PropTypes.array,
};


const withUserId = (func, userId) => (...args) => func(userId, ...args);

// All of the fields are currently not liked to the result of the db; since they can only change one at the time, we optimistically assume that there will be no errors and the last one will be changed

class DemographicsForm extends React.Component {
  constructor(props) {
    super();
    this.formatMessage = props.intl.formatMessage;
  }

  educationOptions = () => (
    [
      { value: 0, text: this.formatMessage(messages.education0) },
      { value: 1, text: this.formatMessage(messages.education1) },
      { value: 2, text: this.formatMessage(messages.education2) },
      { value: 3, text: this.formatMessage(messages.education3) },
      { value: 4, text: this.formatMessage(messages.education4) },
      { value: 5, text: this.formatMessage(messages.education5) },
      { value: 6, text: this.formatMessage(messages.education6) },
      { value: 7, text: this.formatMessage(messages.education7) },
      { value: 8, text: this.formatMessage(messages.education8) },
    ]
  )

  birthyearOptions = (year = new Date().getFullYear()) => (
    (year === 1900) ? [] : [{ value: year, text: `${year}` }].concat(this.birthyearOptions(year - 1))
  )

  domicileOptions = () => {
    const { areas } = this.props;
    if (!areas) return [];
    const options = areas.toArray().map((ele) => {
      const value = ele.get('id');
      const { tFunc } = this.props;
      const text = tFunc(ele.getIn(['attributes', 'title_multiloc']));
      return { value, text };
    });
    // console.log(options.concat({ value: 'outside', text: this.formatMessage(messages.domicileOutside) }))
    return options.concat({ value: 'outside', text: this.formatMessage(messages.domicileOutside) });
  }

  genderOptions = () => (
    [
      { value: 'male', text: this.formatMessage(messages.genderMale) },
      { value: 'female', text: this.formatMessage(messages.genderFemale) },
      { value: 'unspecified', text: this.formatMessage(messages.genderUnspecified) },
    ]
  );

  handleClick = () => {
    const { location } = this.props;
    const { backTo } = location.query;
    this.props.completeUserRegistration(backTo);
  }

  render() {
    const { userId } = this.props;
    const updateCurrentUser = withUserId(this.props.updateCurrentUserRequest, userId);

    return (
      <div>
        <Grid centered verticalAlign={'middle'}>
          <Grid.Column>
            <Header as={'h2'}>
              <FormattedMessage {...messages.header} />
            </Header>
            <Form >
              <RadioInput name={'gender'} options={this.genderOptions()} action={updateCurrentUser} />
              <DropdownInput name={'education'} options={this.educationOptions()} action={updateCurrentUser} />
              <DropdownInput name={'birth_year'} options={this.birthyearOptions()} action={updateCurrentUser} />
              <DropdownInput name={'domicile'} options={this.domicileOptions()} action={updateCurrentUser} />
              {this.props.children}
              <Button
                onClick={this.handleClick}
                fluid
                size={'small'}
                color={'blue'}
                type={'button'}
                style={{ position: 'relative', width: '49.9%', display: 'inline-block', margin: '0' }}
              >
                <FormattedMessage {...messages.next} />
              </Button>
            </Form>
          </Grid.Column>
        </Grid>
      </div>
    );
  }
}

DemographicsForm.propTypes = {
  children: PropTypes.element,
  intl: intlShape.isRequired,
  updateCurrentUserRequest: PropTypes.func.isRequired,
  userId: PropTypes.string.isRequired,
  areas: ImmutablePropTypes.map.isRequired,
  tFunc: PropTypes.func.isRequired,
  completeUserRegistration: PropTypes.func.isRequired,
  location: PropTypes.object.isRequired,
};

const mapStateToProps = createStructuredSelector({
  userId: selectAuthDomain('id'),
  areas: selectResourcesDomain('areas'),
});

export default injectTFunc(injectIntl(preprocess(mapStateToProps, { updateCurrentUserRequest, completeUserRegistration })(DemographicsForm)));
