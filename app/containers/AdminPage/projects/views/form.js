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
import { publishProjectFork, updateProjectFork } from 'resources/projects/sagas';
import { loadProjectRequest } from 'resources/projects/actions';

// messages
import messages from './messages';

class EditorForm extends FormComponent {
  constructor(props) {
    super(props);
    const { routeParams } = props;
    this.slug = routeParams.slug;

    this.saga = publishProjectFork;
    if (this.slug) this.saga = updateProjectFork;

    this.setInitialValues(props);
  }

  componentDidMount() {
    const { routeParams } = this.props;
    const slug = routeParams.slug;
    if (slug) this.props.loadProjectRequest(slug);
  }

  componentWillReceiveProps(nextProps) {
    const { routeParams } = nextProps;
    if (routeParams.slug) this.setInitialValues(nextProps);
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
    const { routeParams, project } = this.props;
    const { loading } = this.state;
    const { errors, error } = this.state;
    if (routeParams.slug && !project) return null;
    console.log(this.values)
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
          fluid={true}
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
  routeParams: PropTypes.object.isRequired,
  project: ImmutablePropTypes.map,
};

const mapStateToProps = createStructuredSelector({
  project: (state, { routeParams }) => state.getIn(['resources', 'projects', routeParams.slug]),
});

export default preprocess(mapStateToProps, { goTo: push, loadProjectRequest })(EditorForm);
