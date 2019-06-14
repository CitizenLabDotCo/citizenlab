import React from 'react';

// libraries
import { Formik } from 'formik';

// components
import InitiativeForm, { FormValues } from 'components/InitiativeForm';

// services
import { Locale } from 'typings';
import { addInitiative, InitiativePublicationStatus, updateInitiative } from 'services/initiatives';

// utils
import { isNilOrError } from 'utils/helperUtils';

// style
import { media } from 'utils/styleUtils';
import styled from 'styled-components';

// intl
import { convertToGeoJson } from 'utils/locationTools';
import { isEqual, pick, get } from 'lodash-es';
import GetInitiative, { GetInitiativeChildProps } from 'resources/GetInitiative';

const StyledInitiativeForm = styled(InitiativeForm)`
  width: 100%;
  min-width: 530px;
  height: 900px;
  ${media.smallerThanMaxTablet`
    min-width: 230px;
  `}
`;

interface InputProps {
  userId: string;
  locale: Locale;
}

interface DataProps {
}

interface Props extends InputProps, DataProps {}

interface State {
  initiativeId: string | null;
}

export default class InitiativesFormWrapper extends React.PureComponent<Props, State> {
  initialValues: FormValues;
  constructor(props) {
    super(props);

    this.state = {
      initiativeId: null
    };
    this.initialValues = {
      title: '',
      body: '',
      topics: [],
      position: '',
    };
  }

  componentDidMount() {
  }

  changedValues = (initialValues, newValues) => {
    const changedKeys = Object.keys(newValues).filter((key) => (
      !isEqual(initialValues[key], newValues[key])
    ));
    return pick(newValues, changedKeys);
  }

  handleSave = (mode: 'create' | 'edit' | 'publish', initialValues = this.initialValues) =>
    async (values: FormValues, { setSubmitting, setErrors, setStatus }) => {
      const { userId, locale } = this.props;
      try {
        const {  title, body, topics, position } = this.changedValues(initialValues, values);
        const { initiativeId } = this.state;
        if ((mode === 'create' && title === '')
          || mode !== 'create' && initialValues === this.initialValues || !initiativeId) {
            return;
          }
        // if position has changed and is not empty, transform it
        const isPositionSafe = (typeof(position) === 'string') && position !== '';
        const locationGeoJSON = isPositionSafe ? await convertToGeoJson(position) : null;
        const locationDescription = isPositionSafe ? position : null;
        // build API readable object
        const apiValues = {
          title_multiloc: { [locale]: title },
          body_multiloc: { [locale]: body },
          topic_ids: topics,
          location_point_geojson: locationGeoJSON,
          location_description: locationDescription,
          publication_status: mode === 'publish' ? 'published' : 'draft' as InitiativePublicationStatus
        };
        if (mode === 'create') {
          const createValues = Object.assign(apiValues, { author_id: userId });
          await addInitiative(createValues);
        } else {
          await updateInitiative(initiativeId, apiValues);
        }
        setStatus('success');
      } catch (errorResponse) {
        const apiErrors = get(errorResponse, 'json.errors'); // TODO merge master and update this.
        setErrors(apiErrors);
        setSubmitting(false);
      }
    }

  renderFnCreate = (props) => {
    return (
      <StyledInitiativeForm
        {...props}
        onSave={this.handleSave('create')}
      />
    );
  }
  renderFnUpdate = (initialValues) => (props) => {
    return (
      <StyledInitiativeForm
        {...props}
        onSave={this.handleSave('edit', initialValues)}
      />
    );
  }

  render() {
    const { initiativeId } = this.state;

    if (initiativeId) {
      return (
        <GetInitiative>
          {initiative => {
            const initialValues = this.getApiValues(initiative);
            return (
              <Formik
                initialValues={{
                  title: '',
                  body: '',
                  topics: [],
                  position: ''
                }}
                render={this.renderFnUpdate(initialValues)}
                onSubmit={this.handleSave('publish', initialValues)}
                validate={InitiativeForm.validate}
              />
            );
          }
        }
        </GetInitiative>
      );
    } else {
      return (
        <Formik
          initialValues={this.initialValues}
          render={this.renderFnCreate}
          onSubmit={this.handleSave('publish')}
          validate={InitiativeForm.validate}
        />
      );
    }
  }
  getApiValues(initiative: GetInitiativeChildProps) {
    if (isNilOrError(initiative)) {
      return undefined;
    } else {
      const { locale } = this.props;
      return ({
        title: get(initiative, `title_multiloc[${locale}]`),
        body: get(initiative, `title_multiloc[${locale}]`),
        topics: get(initiative, 'relationships.topics.data').map(topic => topic.id),
        position: get(initiative, 'position')
      });
    }
  }
}
