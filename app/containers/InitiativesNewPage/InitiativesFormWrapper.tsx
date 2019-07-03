import React from 'react';

// components
import InitiativeForm, { FormValues } from 'components/InitiativeForm';

// services
import { Locale, Multiloc, UploadFile } from 'typings';
import { addInitiative, InitiativePublicationStatus, updateInitiative, IInitiativeData } from 'services/initiatives';

// utils
import { isNilOrError } from 'utils/helperUtils';

// style
import { media } from 'utils/styleUtils';
import clHistory from 'utils/cl-router/history';
import styled from 'styled-components';

// intl
import { convertToGeoJson } from 'utils/locationTools';
import { isEqual, pick, get, omitBy, isEmpty } from 'lodash-es';
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
  hasBannerChanged: boolean;
}

export default class InitiativesFormWrapper extends React.PureComponent<Props, State> {
  initialValues: FormValues;
  constructor(props) {
    super(props);
    this.initialValues = {
      title_multiloc: undefined,
      body_multiloc: undefined,
      topics: [],
      position: undefined,
      banner: undefined,
    };

    this.state = {
      ...this.initialValues,
      initiativeId: null,
      saving: false,
      publishing: false,
      hasBannerChanged: false
    };
  }

  componentWillMount() {
    addInitiative({ publication_status: 'draft' }).then(initiative => {
      this.setState({ initiativeId: initiative.data.id });
      this.initialValues = this.getFormValues(initiative.data);
    });
  }

  changedValues = () => {
    const changedKeys = Object.keys(this.initialValues).filter((key) => (
      key !== 'banner' ? !isEqual(this.initialValues[key], this.state[key]) : undefined
    ));
    return pick(this.state, changedKeys);
  }

  async parsePosition(position: string | undefined | null) {
    let location_point_geojson: Point | null | undefined;
    let location_description: string | null | undefined;
    switch (position) {
      case null:
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
    const changedValues = this.changedValues();
    const { initiativeId, hasBannerChanged, banner } = this.state;
    const { title_multiloc, body_multiloc, topics, position } = changedValues;
    if (isEmpty(changedValues) && !hasBannerChanged) return;

    if (status === 'published') {
      this.setState({ publishing: true });
    } else {
      this.setState({ saving: true });
    }

    try {
      // build API readable object
      const apiValues = {
        title_multiloc,
        body_multiloc,
        topic_ids: topics,
        publication_status: status
      };
      const positionInfo = await this.parsePosition(position);

      // removes undefined values, not null so that null values are removed
      const formAPIValues = omitBy({ ...apiValues, ...positionInfo }, (entry) => (entry === undefined));
      if (hasBannerChanged) {
        formAPIValues.header_bg = banner ? banner.base64 : null;
      }
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
        this.initialValues = this.getFormValues(initiative.data);
        this.setState({ hasBannerChanged: false });
      }
    } catch (errorResponse) {
      const apiErrors = get(errorResponse, 'json.errors');
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

  onChangeBanner = (newValue: UploadFile | null) => {
    this.setState({ banner: newValue, hasBannerChanged: true });
  }

  getFormValues(initiative: IInitiativeData) {
    if (isNilOrError(initiative)) {
      return this.initialValues;
    } else {
      return ({
        title_multiloc: get(initiative, 'attributes.title_multiloc', undefined) || undefined,
        body_multiloc: get(initiative, 'attributes.body_multiloc', undefined) || undefined,
        topics: get(initiative, 'relationships.topics.data', []).map(topic => topic.id),
        position: get(initiative, 'attributes.location_description', undefined) || undefined,
        banner: this.initialValues.banner
      });
    }
  }

  render() {
    const { initiativeId, hasBannerChanged, ...otherProps } = this.state;
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
        onChangeBanner={this.onChangeBanner}
      />
    );
  }
}
