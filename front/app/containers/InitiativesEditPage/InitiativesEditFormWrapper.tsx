import React from 'react';
import { adopt } from 'react-adopt';
// components
import InitiativeForm, {
  FormValues,
  SimpleFormValues,
} from 'components/InitiativeForm';

// services
import { Locale, Multiloc, UploadFile } from 'typings';
import {
  updateInitiative,
  IInitiativeData,
  IInitiativeAdd,
} from 'services/initiatives';
import {
  addInitiativeImage,
  deleteInitiativeImage,
  IInitiativeImageData,
} from 'services/initiativeImages';
import {
  deleteInitiativeFile,
  addInitiativeFile,
} from 'services/initiativeFiles';
import { ITopicData } from 'services/topics';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { isEqual, pick, get, omitBy } from 'lodash-es';
import { convertUrlToUploadFile } from 'utils/fileUtils';

// geoJson
import { geocode } from 'utils/locationTools';
import { Point } from 'geojson';

// tracks
import tracks from './tracks';
import { trackEventByName } from 'utils/analytics';

// resources
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';
import GetAppConfiguration, {
  GetAppConfigurationChildProps,
} from 'resources/GetAppConfiguration';

interface DataProps {
  authUser: GetAuthUserChildProps;
  appConfiguration: GetAppConfigurationChildProps;
}

interface InputProps {
  locale: Locale;
  initiative: IInitiativeData;
  initiativeImage: IInitiativeImageData | null;
  initiativeFiles: UploadFile[] | null;
  onPublished: () => void;
  topics: ITopicData[];
}

interface Props extends DataProps, InputProps {}

interface State extends FormValues {
  initiativeId: string;
  publishing: boolean;
  hasBannerChanged: boolean;
  oldImageId: string | null;
  publishError: boolean;
  apiErrors: any;
  filesToRemove: UploadFile[];
  titleProfanityError: boolean;
  descriptionProfanityError: boolean;
}

function doNothing() {
  return;
}

class InitiativesEditFormWrapper extends React.PureComponent<Props, State> {
  initialValues: SimpleFormValues;
  constructor(props) {
    super(props);

    const { initiative, initiativeFiles } = props;

    this.initialValues = this.getFormValues(initiative);

    this.state = {
      ...this.initialValues,
      oldImageId: null,
      image: undefined,
      initiativeId: initiative.id,
      publishing: false,
      hasBannerChanged: false,
      banner: undefined,
      files: initiativeFiles || [],
      publishError: false,
      apiErrors: null,
      filesToRemove: [],
      titleProfanityError: false,
      descriptionProfanityError: false,
    };
  }

  componentDidMount() {
    const { initiativeImage, initiative } = this.props;
    if (initiativeImage && initiativeImage.attributes.versions.large) {
      const url = initiativeImage.attributes.versions.large;
      const id = initiativeImage.id;
      convertUrlToUploadFile(url, id, null).then((image) => {
        this.setState({ image });
      });
    }
    if (initiative && initiative.attributes.header_bg.large) {
      const url = initiative.attributes.header_bg.large;
      convertUrlToUploadFile(url, null, null).then((banner) => {
        this.setState({ banner });
      });
    }
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
        location_point_geojson = await geocode(position);
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
    // build API readable object
    const { title_multiloc, body_multiloc, topic_ids, position } =
      changedValues;
    const positionInfo = await this.parsePosition(position);

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

  handlePublish = async () => {
    const changedValues = this.changedValues();
    const {
      initiativeId,
      hasBannerChanged,
      image,
      oldImageId,
      banner,
      publishing,
      filesToRemove,
      files,
    } = this.state;
    const { onPublished, locale, appConfiguration, authUser } = this.props;

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
      const initiative = await updateInitiative(initiativeId, {
        ...formAPIValues,
        publication_status: 'published',
      });

      // feed back what was saved to the api into the initialValues object
      // so that we can determine with certainty what has changed since last
      // successful save.
      this.initialValues = this.getFormValues(initiative.data);
      this.setState({ hasBannerChanged: false });

      // save any changes to initiative image.
      if (image && image.base64 && !image.id) {
        await addInitiativeImage(initiativeId, image.base64);
      }
      if (oldImageId) {
        deleteInitiativeImage(initiativeId, oldImageId).then(() => {
          // save image id in case we need to remove it later.
          this.setState({ oldImageId: null });
          // remove image from remote if it was saved
        });
      }

      // saves changes to files
      filesToRemove.map((file) => {
        deleteInitiativeFile(initiativeId, file.id as string)
          // we checked for id before adding them in this array
          .catch((errorResponse) => {
            const apiErrors = errorResponse.json.errors;
            this.setState((state) => ({
              apiErrors: { ...state.apiErrors, ...apiErrors },
            }));

            setTimeout(() => {
              this.setState((state) => ({
                apiErrors: { ...state.apiErrors, file: undefined },
              }));
            }, 5000);
          });
      });
      files.map((file) => {
        if (!file.id) {
          addInitiativeFile(initiativeId, file.base64, file.name)
            .then((res) => {
              file.id = res.data.id;
            })
            .catch((errorResponse) => {
              const apiErrors = get(errorResponse, 'json.errors');
              this.setState((state) => ({
                apiErrors: { ...state.apiErrors, ...apiErrors },
              }));
              setTimeout(() => {
                this.setState((state) => ({
                  apiErrors: { ...state.apiErrors, file: undefined },
                }));
              }, 5000);
            });
        }
      });

      onPublished();
    } catch (errorResponse) {
      const apiErrors = get(errorResponse, 'json.errors');
      this.setState((state) => ({
        apiErrors: { ...state.apiErrors, ...apiErrors },
        publishError: true,
      }));

      const profanityApiError = apiErrors.base.find(
        (apiError) => apiError.error === 'includes_banned_words'
      );

      if (profanityApiError) {
        const titleProfanityError = profanityApiError.blocked_words.some(
          (blockedWord) => blockedWord.attribute === 'title_multiloc'
        );
        const descriptionProfanityError = profanityApiError.blocked_words.some(
          (blockedWord) => blockedWord.attribute === 'body_multiloc'
        );

        if (titleProfanityError) {
          trackEventByName(tracks.titleProfanityError.name, {
            locale,
            profaneMessage: changedValues.title_multiloc?.[locale],
            proposalId: initiativeId,
            location: 'InitiativesEditFormWrapper (citizen side)',
            userId: !isNilOrError(authUser) ? authUser.id : null,
            host: !isNilOrError(appConfiguration)
              ? appConfiguration.attributes.host
              : null,
          });

          this.setState({
            titleProfanityError,
          });
        }

        if (descriptionProfanityError) {
          trackEventByName(tracks.descriptionProfanityError.name, {
            locale,
            profaneMessage: changedValues.body_multiloc?.[locale],
            proposalId: initiativeId,
            location: 'InitiativesEditFormWrapper (citizen side)',
            userId: !isNilOrError(authUser) ? authUser.id : null,
            host: !isNilOrError(appConfiguration)
              ? appConfiguration.attributes.host
              : null,
          });

          this.setState({
            descriptionProfanityError,
          });
        }
      }
    }
    this.setState({ publishing: false });
  };

  onChangeTitle = (title_multiloc: Multiloc) => {
    this.setState({ title_multiloc, titleProfanityError: false });
  };

  onChangeBody = (body_multiloc: Multiloc) => {
    this.setState({ body_multiloc, descriptionProfanityError: false });
  };

  onChangeTopics = (topic_ids: string[]) => {
    this.setState({ topic_ids });
  };

  onChangePosition = (position: string) => {
    this.setState({ position });
  };

  onChangeBanner = (newValue: UploadFile | null) => {
    this.setState({ banner: newValue, hasBannerChanged: true });
  };

  onChangeImage = (newValue: UploadFile | null) => {
    if (newValue) {
      this.setState({ image: newValue });
    } else {
      this.setState((state) => {
        const currentImageId = state.image && state.image.id;
        if (currentImageId) {
          return { image: newValue, oldImageId: currentImageId };
        } else return { image: newValue, oldImageId: state.oldImageId };
      });
    }
  };

  onAddFile = (file: UploadFile) => {
    this.setState(({ files }) => ({ files: [...files, file] }));
  };

  onRemoveFile = (fileToRemove: UploadFile) => {
    this.setState(({ files }) => ({
      files: [...files].filter((file) => file.base64 !== fileToRemove.base64),
    }));
    if (fileToRemove.id) {
      this.setState(({ filesToRemove }) => ({
        filesToRemove: [...filesToRemove, fileToRemove],
      }));
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
    const { titleProfanityError, descriptionProfanityError, ...otherProps } =
      this.state;
    const { locale, initiativeImage, topics } = this.props;

    if (this.state.image === undefined && initiativeImage) return null;

    return (
      <InitiativeForm
        onPublish={this.handlePublish}
        onSave={doNothing}
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
        titleProfanityError={titleProfanityError}
        descriptionProfanityError={descriptionProfanityError}
      />
    );
  }
}

const Data = adopt<DataProps, InputProps>({
  appConfiguration: <GetAppConfiguration />,
  authUser: <GetAuthUser />,
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => (
      <InitiativesEditFormWrapper {...inputProps} {...dataProps} />
    )}
  </Data>
);
