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
import { loadPageRequest } from 'resources/pages/actions';

// messages
import messages from './messages';

class EditorForm extends FormComponent {
  constructor(props) {
    super();
    this.setInitialValues(props);
  }

  handleSuccess = () => {
    this.props.goTo('/admin/pages');
  }

  setInitialValues = ({ page }) => {
    if (!page) return null;
    this.values.title = page.getIn(['attributes', 'title_multiloc']).toJS();
    this.values.description = page.getIn(['attributes', 'body_multiloc']).toJS();
    this.values.slug = page.getIn(['attributes', 'slug']);
    this.values.id = page.getIn(['id']);
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
  page: ImmutablePropTypes.map,
};

const mapStateToProps = createStructuredSelector({
  page: (state, { slug }) => state.getIn(['resources', 'pages', slug]),
});

export default preprocess(mapStateToProps, { goTo: push, loadPageRequest })(EditorForm);
