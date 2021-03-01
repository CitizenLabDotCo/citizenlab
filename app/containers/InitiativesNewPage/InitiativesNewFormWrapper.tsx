import React from 'react';

// components
import InitiativeForm, {
  FormValues,
  SimpleFormValues,
} from 'components/InitiativeForm';

// services
import { Locale, Multiloc, UploadFile } from 'typings';
import {
  addInitiative,
  updateInitiative,
  IInitiativeData,
  IInitiativeAdd,
} from 'services/initiatives';
import { ITopicData } from 'services/topics';

// utils
import { isNilOrError } from 'utils/helperUtils';

// style
import { media } from 'utils/styleUtils';
import clHistory from 'utils/cl-router/history';
import styled from 'styled-components';

// intl
import { convertToGeoJson } from 'utils/locationTools';
import { isEqual, pick, get, omitBy, isEmpty, debounce } from 'lodash-es';
import { Point } from 'geojson';
import {
  addInitiativeImage,
  deleteInitiativeImage,
} from 'services/initiativeImages';
import {
  deleteInitiativeFile,
  addInitiativeFile,
} from 'services/initiativeFiles';
import { reportError } from 'utils/loggingUtils';

const StyledInitiativeForm = styled(InitiativeForm)`
  width: 100%;
  min-width: 530px;
  height: 900px;
  ${media.smallerThanMaxTablet`
    min-width: 230px;
  `}
`;

interface InputProps {
  locale: Locale;
  location_description?: string;
  location_point_geojson?: Point;
  topics: ITopicData[];
}

interface DataProps {}

interface Props extends InputProps, DataProps {}

interface State extends FormValues {
  initiativeId: string | null;
  saving: boolean;
  publishing: boolean;
  hasBannerChanged: boolean;
  hasImageChanged: boolean;
  imageId: string | null;
  publishError: boolean;
  apiErrors: any;
  location_point_geojson?: Point;
}

export default class InitiativesNewFormWrapper extends React.PureComponent<
  Props,
  State
> {
  initialValues: SimpleFormValues;
  constructor(props) {
    super(props);
    // These are the properties that really get matched against back-end before re-send
    // the rest of formvalues (image, banner, files) get sent on each change.
    this.initialValues = {
      title_multiloc: undefined,
      body_multiloc: undefined,
      topic_ids: [],
      position: undefined,
    };

    this.state = {
      ...this.initialValues,
      initiativeId: null,
      saving: false,
      publishing: false,
      hasBannerChanged: false,
      hasImageChanged: false,
      imageId: null,
      banner: undefined,
      image: undefined,
      files: [],
      publishError: false,
      apiErrors: null,
      position: props.location_description,
      location_point_geojson: props.location_point_geojson,
    };
  }

  componentDidMount() {
    addInitiative({ publication_status: 'draft' }).then((initiative) => {
      this.setState({ initiativeId: initiative.data.id });
    });
  }

  changedValues = () => {
    const changedKeys = Object.keys(this.initialValues).filter((key) => {
      return !isEqual(this.initialValues[key], this.state[key]);
    });
    return pick(this.state, changedKeys);
  };

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

  async getValuesToSend(
    changedValues: Partial<FormValues>,
    hasBannerChanged: boolean,
    banner: UploadFile | undefined | null
  ) {
    const {
      title_multiloc,
      body_multiloc,
      topic_ids,
      position,
    } = changedValues;
    const { location_point_geojson } = this.state;

    let positionInfo;
    if (location_point_geojson) {
      positionInfo = {
        location_point_geojson,
        location_description: position,
      };
    } else {
      positionInfo = await this.parsePosition(position);
    }

    // removes undefined values, not null values that are used to remove previously used values
    const formAPIValues = omitBy(
      {
        title_multiloc,
        body_multiloc,
        topic_ids,
        ...positionInfo,
      },
      (entry) => entry === undefined
    );

    if (hasBannerChanged) {
      formAPIValues.header_bg = banner ? banner.base64 : null;
    }
    return formAPIValues as Partial<IInitiativeAdd>;
  }

  handleSave = async () => {
    const changedValues = this.changedValues();
    const {
      initiativeId,
      hasBannerChanged,
      hasImageChanged,
      image,
      banner,
      saving,
    } = this.state;
    // if nothing has changed, do noting.
    if (isEmpty(changedValues) && !hasBannerChanged && !hasImageChanged) return;

    // if we're already publishing, do nothing.
    if (saving) return;

    // setting flags for user feedback and avoiding double sends.
    this.setState({ saving: true });

    try {
      const formAPIValues = await this.getValuesToSend(
        changedValues,
        hasBannerChanged,
        banner
      );
      // save any changes to the initiative data.
      if (!isEmpty(formAPIValues)) {
        let initiative;

        if (initiativeId) {
          initiative = await updateInitiative(initiativeId, formAPIValues);
        } else {
          initiative = await addInitiative({
            ...formAPIValues,
            publication_status: 'draft',
          });
          this.setState({ initiativeId: initiative.data.id });
        }
        // feed back what was saved to the api into the initialValues object
        // so that we can determine with certainty what has changed since last
        // successful save.
        this.initialValues = this.getFormValues(initiative.data);
        this.setState({ hasBannerChanged: false });
      }

      // save any changes to initiative image.
      if (hasImageChanged && initiativeId) {
        if (image && image.base64) {
          const imageRemote = await addInitiativeImage(
            initiativeId,
            image.base64
          );
          // save image id in case we need to remove it later.
          this.setState({ imageId: imageRemote.data.id });
        } else if (!image && this.state.imageId) {
          deleteInitiativeImage(initiativeId, this.state.imageId);
          this.setState({ imageId: null });
        } else {
          // Image saving mechanism works on the hypothesis that any defined
          // image will have a base64 key, and when you need to remove an image
          // it was previously saved. If not, let's report it so it gets fixed.
          reportError('There was an error with an initiative image');
        }
        this.setState({ hasImageChanged: false });
      }
      this.setState({ saving: false });
    } catch (errorResponse) {
      // const apiErrors = get(errorResponse, 'json.errors');
      // saving changes while working should have a minimal error feedback,
      // maybe in the saving indicator, since it's error-resistant, ie what wasn't
      // saved this time will be next time user leaves a field, or on publish call.
      this.setState({ saving: false });
    }
  };

  debouncedSave = debounce(this.handleSave, 500);

  handlePublish = async () => {
    const changedValues = this.changedValues();
    const {
      initiativeId,
      hasBannerChanged,
      hasImageChanged,
      image,
      banner,
      publishing,
    } = this.state;

    // if we're already saving, do nothing.
    if (publishing) return;

    // setting flags for user feedback and avoiding double sends.
    this.setState({ publishing: true });

    try {
      const formAPIValues = await this.getValuesToSend(
        changedValues,
        hasBannerChanged,
        banner
      );
      let initiative;

      // save any changes to the initiative data.
      if (initiativeId) {
        initiative = await updateInitiative(initiativeId, {
          ...formAPIValues,
          publication_status: 'published',
        });
      } else {
        initiative = await addInitiative({
          ...formAPIValues,
          publication_status: 'published',
        });

        this.setState({ initiativeId: initiative.data.id });
      }
      // feed back what was saved to the api into the initialValues object
      // so that we can determine with certainty what has changed since last
      // successful save.
      this.initialValues = this.getFormValues(initiative.data);
      this.setState({ hasBannerChanged: false });

      // save any changes to initiative image.
      if (hasImageChanged && initiativeId) {
        if (image && image.base64) {
          const imageRemote = await addInitiativeImage(
            initiativeId,
            image.base64
          );
          // save image id in case we need to remove it later.
          this.setState({ imageId: imageRemote.data.id });
          // remove image from remote if it was saved
        } else if (!image && this.state.imageId) {
          deleteInitiativeImage(initiativeId, this.state.imageId).then(() => {
            this.setState({ imageId: null });
          });
        } else if (image) {
          // Image saving mechanism works on the hypothesis that any defined
          // image will have a base64 key, if not, something wrong has happened.
          reportError('Unexpected state of initiative image');
        }
        this.setState({ hasImageChanged: false });
      }
      this.setState({ publishing: false });

      clHistory.push({
        pathname: `/initiatives/${initiative.data.attributes.slug}`,
        search: `?new_initiative_id=${initiative.data.id}`,
      });
    } catch (errorResponse) {
      const apiErrors = get(errorResponse, 'json.errors');
      this.setState((state) => ({
        apiErrors: { ...state.apiErrors, ...apiErrors },
        publishError: true,
      }));
      setTimeout(() => {
        this.setState({ publishError: false });
      }, 5000);
    }
  };

  onChangeTitle = (title_multiloc: Multiloc) => {
    this.setState({ title_multiloc });
  };
  onChangeBody = (body_multiloc: Multiloc) => {
    this.setState({ body_multiloc });
  };
  onChangeTopics = (topic_ids: string[]) => {
    this.setState({ topic_ids });
  };
  onChangePosition = (position: string) => {
    this.setState({ position, location_point_geojson: undefined });
  };
  onChangeBanner = (newValue: UploadFile | null) => {
    this.setState({ banner: newValue, hasBannerChanged: true });
  };
  onChangeImage = (newValue: UploadFile | null) => {
    this.setState({ image: newValue, hasImageChanged: true });
  };
  onAddFile = (file: UploadFile) => {
    const { initiativeId } = this.state;
    if (initiativeId) {
      this.setState({ saving: true });
      addInitiativeFile(initiativeId, file.base64, file.name)
        .then((res) => {
          file.id = res.data.id;
          this.setState(({ files }) => ({
            files: [...files, file],
            saving: false,
          }));
        })
        .catch((errorResponse) => {
          const apiErrors = get(errorResponse, 'json.errors');
          this.setState((state) => ({
            apiErrors: { ...state.apiErrors, ...apiErrors },
            saving: false,
          }));
          setTimeout(() => {
            this.setState((state) => ({
              apiErrors: { ...state.apiErrors, file: undefined },
            }));
          }, 5000);
        });
    }
  };
  onRemoveFile = (fileToRemove: UploadFile) => {
    const { initiativeId } = this.state;

    if (initiativeId && fileToRemove.id) {
      this.setState({ saving: true });
      deleteInitiativeFile(initiativeId, fileToRemove.id).then(() =>
        this.setState(({ files }) => ({
          files: files.filter((file) => file.base64 !== fileToRemove.base64),
          saving: false,
        }))
      );
    }
  };

  getFormValues(initiative: IInitiativeData) {
    if (isNilOrError(initiative)) {
      return this.initialValues;
    } else {
      return {
        title_multiloc:
          get(initiative, 'attributes.title_multiloc', undefined) || undefined,
        body_multiloc:
          get(initiative, 'attributes.body_multiloc', undefined) || undefined,
        topic_ids: get(initiative, 'relationships.topics.data', []).map(
          (topic) => topic.id
        ),
        position:
          get(initiative, 'attributes.location_description', undefined) ||
          undefined,
      };
    }
  }

  render() {
    const {
      initiativeId,
      hasBannerChanged,
      hasImageChanged,
      ...otherProps
    } = this.state;
    const { locale, topics } = this.props;

    return (
      <StyledInitiativeForm
        onPublish={this.handlePublish}
        onSave={this.debouncedSave}
        locale={locale}
        {...otherProps}
        onChangeTitle={this.onChangeTitle}
        onChangeBody={this.onChangeBody}
        onChangeTopics={this.onChangeTopics}
        onChangePosition={this.onChangePosition}
        onChangeBanner={this.onChangeBanner}
        onChangeImage={this.onChangeImage}
        onAddFile={this.onAddFile}
        onRemoveFile={this.onRemoveFile}
        topics={topics}
      />
    );
  }
}
