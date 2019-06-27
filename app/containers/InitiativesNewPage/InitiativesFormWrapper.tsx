import React from 'react';

// components
import InitiativeForm, { FormValues } from 'components/InitiativeForm';

// services
import { Locale, Multiloc } from 'typings';
import { addInitiative, InitiativePublicationStatus, updateInitiative } from 'services/initiatives';

// utils
import { isNilOrError } from 'utils/helperUtils';

// style
import { media } from 'utils/styleUtils';
import styled from 'styled-components';

// intl
import { convertToGeoJson } from 'utils/locationTools';
import { isEqual, pick, get, isNil, omitBy } from 'lodash-es';
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

interface State extends FormValues {
  initiativeId: string | null;
  saving: boolean;
  publishing: boolean;
}

export default class InitiativesFormWrapper extends React.PureComponent<Props, State> {
  initialValues: FormValues;
  constructor(props) {
    super(props);
    this.initialValues = {
      title_multiloc: {},
      body_multiloc: {},
      topics: [],
      position: '',
    };

    this.state = {
      ...this.initialValues,
      initiativeId: null,
      saving: false,
      publishing: false
    };
  }

  changedValues = () => {
    const changedKeys = Object.keys(this.initialValues).filter((key) => (
      !isEqual(this.initialValues[key], this.state[key])
    ));
    return pick(this.state, changedKeys);
  }

  handleCreate = async () => {
    const { userId } = this.props;
    try {
      this.setState({ saving: true });
      const {  title_multiloc, body_multiloc, topics, position } = this.changedValues();
      // if position has changed and is not empty, transform it
      const isPositionSafe = !!(typeof position === 'string' && position !== '');
      const locationGeoJSON = isPositionSafe ? await convertToGeoJson(position) : null;
      const locationDescription = isPositionSafe ? position : null;
      // build API readable object
      const apiValues = {
        title_multiloc,
        body_multiloc,
        topic_ids: topics,
        location_point_geojson: locationGeoJSON,
        location_description: locationDescription,
        publication_status: 'draft' as InitiativePublicationStatus,
        author_id: userId
      };
      const createValues = omitBy(apiValues, isNil);
      console.log(createValues);
      await addInitiative(createValues);
    } catch (errorResponse) {
      const apiErrors = get(errorResponse, 'json.errors'); // TODO merge master and update this.
        // setErrors(apiErrors);
    }
    this.setState({ saving: false });
  }

  handleEdit = async () => {
    const { initiativeId } = this.state;

    if (!initiativeId) return; // TODO

    try {
      this.setState({ saving: true });
      const {  title_multiloc, body_multiloc, topics, position } = this.changedValues();
      // if position has changed and is not empty, transform it
      const isPositionSafe = !!(typeof position === 'string' && position !== '');
      const locationGeoJSON = isPositionSafe ? await convertToGeoJson(position) : null;
      const locationDescription = isPositionSafe ? position : null;
      // build API readable object
      const apiValues = {
        title_multiloc,
        body_multiloc,
        topic_ids: topics,
        location_point_geojson: locationGeoJSON,
        location_description: locationDescription,
        publication_status: 'draft' as InitiativePublicationStatus
      };
      const editValues = omitBy(apiValues, isNil);
      await updateInitiative(initiativeId, editValues);
    } catch (errorResponse) {
      const apiErrors = get(errorResponse, 'json.errors'); // TODO merge master and update this.
        // setErrors(apiErrors);
    }
    this.setState({ saving: false });
  }
  handlePublish = async () => {
    const { initiativeId } = this.state;

    if (!initiativeId) return; // TODO

    try {
      this.setState({ publishing: true });
      const {  title_multiloc, body_multiloc, topics, position } = this.changedValues();
      // if position has changed and is not empty, transform it
      const isPositionSafe = !!(typeof position === 'string' && position !== '');
      const locationGeoJSON = isPositionSafe ? await convertToGeoJson(position) : null;
      const locationDescription = isPositionSafe ? position : null;
      // build API readable object
      const apiValues = {
        title_multiloc,
        body_multiloc,
        topic_ids: topics,
        location_point_geojson: locationGeoJSON,
        location_description: locationDescription,
        publication_status: 'published' as InitiativePublicationStatus
      };
      const editValues = omitBy(apiValues, isNil);
      await updateInitiative(initiativeId, editValues);
    } catch (errorResponse) {
      const apiErrors = get(errorResponse, 'json.errors'); // TODO merge master and update this.
        // setErrors(apiErrors);
    }
    this.setState({ publishing: false });
  }

  onChangeTitle = (title_multiloc: Multiloc) => {
    this.setState({ title_multiloc });
  }
  onChangeBody = (body_multiloc: Multiloc) => {
    this.setState({ body_multiloc });
  }
  onChangeTopics = (topics: string[]) => {
    this.setState({ topics });
  }
  onChangePosition = (position: string) => {
    this.setState({ position });
  }

  getApiValues(initiative: GetInitiativeChildProps) {
    if (isNilOrError(initiative)) {
      return this.initialValues;
    } else {
      return ({
        title_multiloc: get(initiative, 'title_multiloc'),
        body_multiloc: get(initiative, 'body_multiloc'),
        topics: get(initiative, 'relationships.topics.data').map(topic => topic.id),
        position: get(initiative, 'position')
      });
    }
  }

  render() {
    const { initiativeId, ...otherProps } = this.state;
    const { locale } = this.props;

    if (initiativeId) {
      return (
        <GetInitiative>
          {initiative => {
            this.initialValues = this.getApiValues(initiative);
            return (
              <StyledInitiativeForm
                onPublish={this.handlePublish}
                onSave={this.handleEdit}
                locale={locale}
                {...otherProps}
                onChangeTitle={this.onChangeTitle}
                onChangeBody={this.onChangeBody}
                onChangeTopics={this.onChangeTopics}
                onChangePosition={this.onChangePosition}
              />
            );
          }
        }
        </GetInitiative>
      );
    } else {
      return (
        <StyledInitiativeForm
          onPublish={this.handlePublish}
          onSave={this.handleCreate}
          locale={locale}
          {...otherProps}
          onChangeTitle={this.onChangeTitle}
          onChangeBody={this.onChangeBody}
          onChangeTopics={this.onChangeTopics}
          onChangePosition={this.onChangePosition}
        />
      );
    }
  }
}
