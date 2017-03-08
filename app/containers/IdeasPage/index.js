/*
 *
 * IdeasPage
 *
 */

import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import styled from 'styled-components';
import { FormattedMessage } from 'react-intl';
import { createStructuredSelector } from 'reselect';
import { LocalForm, Control } from 'react-redux-form';
import makeSelectIdeasPage from './selectors';
import messages from './messages';
import {
  Button,
  Label,
} from '../../components/Foundation';

const IdeaListDiv = styled.div`
  margin-bottom: 40px;
`;

export class IdeasPage extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  constructor() {
    super();
    this.handleUpdate = this.handleUpdate.bind(this);
    this.state = {
      ideas: [
        { heading: 'Eureka', description: 'I like to...' },
      ],
    };
  }

  handleUpdate(form) {
    console.log("[LOG]", 'handleUpdate'); // eslint-disable-line
    console.log("[DEBUG] form =", form); // eslint-disable-line
  }

  handleChange(values) {
    console.log("[LOG]", 'handleChange'); // eslint-disable-line
    console.log("[DEBUG] values =", values); // eslint-disable-line
  }

  handleSubmit(values) {
    console.log("[LOG]", 'handleSubmit'); // eslint-disable-line
    console.log("[DEBUG] values =", values); // eslint-disable-line
    this.setState({ ideas: this.state.ideas.concat([values]) });
  }

  render() {
    return (
      <div>
        <Helmet
          title="IdeasPage"
          meta={[
            { name: 'description', content: 'Description of IdeasPage' },
          ]}
        />

        <h1>
          <FormattedMessage {...messages.header} />
        </h1>

        <p>Total { this.state.ideas.length } ideas</p>

        <IdeaListDiv>
          {this.state.ideas.map((idea, index) => (
            <Label className="success" key={index}>{ idea.heading }</Label>
          ))}
        </IdeaListDiv>

        <LocalForm
          model="idea"
          onUpdate={(form) => this.handleUpdate(form)}
          onChange={(values) => this.handleChange(values)}
          onSubmit={(values) => this.handleSubmit(values)}
        >
          <label htmlFor=".clIdeaFormHeading">Heading
              <Control.text model=".heading" className="clIdeaFormHeading" required />
          </label>
          <label htmlFor=".clIdeaFormDescription">Description
            <Control.text model=".description" className="clIdeaFormDescription" required />
          </label>

          <Button>Submit</Button>
        </LocalForm>
      </div>
    );
  }
}

IdeasPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
};

const mapStateToProps = createStructuredSelector({
  IdeasPage: makeSelectIdeasPage(),
});

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(IdeasPage);
