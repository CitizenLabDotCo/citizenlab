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
import clHistory from 'utils/cl-router/history';
import styled from 'styled-components';

// intl
import { convertToGeoJson } from 'utils/locationTools';
import { isEqual, pick, get, isNil, omitBy } from 'lodash-es';
import GetInitiative, { GetInitiativeChildProps } from 'resources/GetInitiative';
import { Point } from 'geojson';

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
      position: undefined,
    };

    this.state = {
      ...this.initialValues,
      initiativeId: null,
      saving: false,
      publishing: false
    };
  }

  componentWillMount() {
    addInitiative({ publication_status: 'draft' }).then(initiative => {
      this.setState({ initiativeId: initiative.data.id });
      this.initialValues = initiative.data;
    });
  }

  changedValues = () => {
    console.log(this.initialValues, this.state);
    const changedKeys = Object.keys(this.initialValues).filter((key) => (
      !isEqual(this.initialValues[key], this.state[key]))
    );
    console.log(this.state, changedKeys);
    return pick(this.state, changedKeys);
  }

  async parsePosition(position: string | undefined | null) {
    let location_point_geojson: Point | null | undefined;
    let location_description: string | null | undefined;
    switch (position) {
      case null:
        location_point_geojson = null;
        location_description = null;
        break;
      case '':
        location_point_geojson = null;
        location_description = null;
        break;

      case undefined:
        location_point_geojson = undefined;
        location_description = undefined;
        break;

      default:
        location_point_geojson = await convertToGeoJson(position);
        location_description = position;
        break;
    }
    return { location_point_geojson, location_description };
  }

  handleSave = (status: InitiativePublicationStatus) => async () => {
    if (status === 'published') {
      this.setState({ publishing: true });
    } else {
      this.setState({ saving: true });
    }
    try {
      const { initiativeId } = this.state;
      const { title_multiloc, body_multiloc, topics, position } = this.changedValues();
      // build API readable object
      const apiValues = {
        title_multiloc,
        body_multiloc,
        topic_ids: topics,
        publication_status: status,
      };
      const positionInfo = await this.parsePosition(position);
      console.log(apiValues);

      // removes undefined values, not null so that position can be removed
      const formAPIValues = omitBy({ ...apiValues, ...positionInfo }, (entry) => (entry === undefined));
      console.log(formAPIValues);
      let initiative;
      if (initiativeId) {
        initiative = await updateInitiative(initiativeId, formAPIValues);
      } else {
        initiative = await addInitiative(formAPIValues);
        this.setState({ initiativeId: initiative.data.id });
      }
      if (status === 'published') {
        clHistory.push(`initiatives/${initiative.data.slug}`);
      } else {
        this.initialValues = this.getApiValues(initiative.data);
        console.log(this.getApiValues(initiative.data));
      }
    } catch (errorResponse) {
      const apiErrors = get(errorResponse, 'json.errors');
        // setErrors(apiErrors);
      console.log(errorResponse, apiErrors);
    }
    this.setState({ saving: false, publishing: false });
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
        topics: get(initiative, 'relationships.topics.data', []).map(topic => topic.id),
        position: get(initiative, 'position')
      });
    }
  }

  render() {
    const { initiativeId, ...otherProps } = this.state;
    const { locale } = this.props;

    return (
      <StyledInitiativeForm
        onPublish={this.handleSave('published')}
        onSave={this.handleSave('draft')}
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
