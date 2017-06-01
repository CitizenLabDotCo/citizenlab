import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { push } from 'react-router-redux';

// import PropTypes from 'prop-types';
// import ImmutablePropTypes from 'react-immutable-proptypes';

// components
// import { FormattedMessage } from 'react-intl';
import FormComponent from 'components/forms/formComponent';
import { Form } from 'semantic-ui-react';
import RtfEditor from 'components/forms/inputs/rtfEditor';
import Button from 'components/buttons/loader';


// store
import { preprocess } from 'utils';
import { createStructuredSelector } from 'reselect';
import { loadIdeaRequest } from 'resources/ideas/actions';

// messages
import messages from './messages';

class EditorForm extends FormComponent {
  constructor(props) {
    super();
    this.setInitialValues(props);
  }

  handleSuccess = () => {
    this.props.goTo('/admin/ideas');
  }

  setInitialValues = ({ idea }) => {
    if (!idea) return null;
    this.values.title = idea.getIn(['attributes', 'title_multiloc']).toJS();
    this.values.description = idea.getIn(['attributes', 'description_multiloc']).toJS();
    this.values.slug = idea.getIn(['attributes', 'slug']);
    this.values.id = idea.getIn(['id']);
    return null;
  }

  render() {
    const { loading } = this.state;
    const { errors, error } = this.state;
    return (
      <Form error={error} onSubmit={this.handleSubmit}>
        <RtfEditor
          name={'title'}
          action={this.handleChange}
          errors={errors.text}
          initialValue={this.values.title}
        />
        <RtfEditor
          name={'description'}
          action={this.handleChange}
          errors={errors.text}
          initialValue={this.values.description}
        />
        <Button
          fluid
          onClick={this.handleClick}
          message={messages.publishButton}
          loading={loading}
        />
      </Form>
    );
  }
}

EditorForm.propTypes = {
  goTo: PropTypes.func,
  slug: PropTypes.string,
  idea: ImmutablePropTypes.map,
};

const mapStateToProps = createStructuredSelector({
  idea: (state, { slug }) => state.getIn(['resources', 'ideas', slug]),
});

export default preprocess(mapStateToProps, { goTo: push, loadIdeaRequest })(EditorForm);
