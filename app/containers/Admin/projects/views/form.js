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
import { loadProjectRequest } from 'resources/projects/actions';

// messages
import messages from './messages';

class EditorForm extends FormComponent {
  constructor(props) {
    super();
    this.setInitialValues(props);
  }

  handleSuccess = () => {
    this.props.goTo('/admin/projects');
  }

  setInitialValues = ({ project }) => {
    if (!project) return null;
    this.values.title = project.getIn(['attributes', 'title_multiloc']).toJS();
    this.values.description = project.getIn(['attributes', 'description_multiloc']).toJS();
    this.values.slug = project.getIn(['attributes', 'slug']);
    this.values.id = project.getIn(['id']);
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
  project: ImmutablePropTypes.map,
};

const mapStateToProps = createStructuredSelector({
  project: (state, { slug }) => state.getIn(['resources', 'projects', slug]),
});

export default preprocess(mapStateToProps, { goTo: push, loadProjectRequest })(EditorForm);
