import { combineLatest, of, Observable, BehaviorSubject } from 'rxjs';
import { switchMap, map, filter as rxFilter } from 'rxjs/operators';

// i18n
import { getLocalized } from 'utils/i18n';

// streams
import { projectFilesStream } from 'services/projectFiles';
import { projectImagesStream } from 'services/projectImages';

// utils
import { convertUrlToUploadFileObservable } from 'utils/fileUtils';
import { isNilOrError } from 'utils/helperUtils';

// typings
import { UploadFile, Locale } from 'typings';
import { IProjectFormState, IProject } from 'services/projects';
import { IAppConfiguration } from 'services/appConfiguration';
import { IAreas } from 'services/areas';

export const getDefaultState = () =>
  ({
    processing: false,
    project: undefined,
    publicationStatus: 'draft',
    projectType: 'timeline',
    projectAttributesDiff: {
      admin_publication_attributes: {
        publication_status: 'draft',
      },
    },
    projectHeaderImage: null,
    presentationMode: 'card',
    projectImages: [],
    projectImagesToRemove: [],
    projectFiles: [],
    projectFilesToRemove: [],
    titleError: null,
    apiErrors: {},
    saved: false,
    areas: [],
    areaType: 'all',
    locale: 'en',
    currentTenant: null,
    areasOptions: [],
    submitState: 'disabled',
    slug: null,
    showSlugErrorMessage: false,
  } as IProjectFormState);

export function initSubscriptions(
  locale$: Observable<Locale>,
  currentTenant$: Observable<IAppConfiguration>,
  areas$: Observable<IAreas>,
  project$: Observable<IProject | null>,
  processing$: BehaviorSubject<boolean>
) {
  return [
    combineLatest([locale$, currentTenant$, areas$, project$]).subscribe(
      ([locale, currentTenant, areas, project]) => {
        this.setState((state) => {
          const publicationStatus = project
            ? project.data.attributes.publication_status
            : state.publicationStatus;
          const projectType = project
            ? project.data.attributes.process_type
            : state.projectType;
          const areaType =
            project && project.data.relationships.areas.data.length > 0
              ? 'selection'
              : 'all';
          const areasOptions = areas.data.map((area) => ({
            value: area.id,
            label: getLocalized(
              area.attributes.title_multiloc,
              locale,
              currentTenant.data.attributes.settings.core.locales
            ),
          }));
          const slug = project ? project.data.attributes.slug : null;

          const newState: IProjectFormState = {
            ...state,
            locale,
            currentTenant,
            project,
            publicationStatus,
            projectType,
            areaType,
            areasOptions,
            slug,
            presentationMode:
              (project && project.data.attributes.presentation_mode) ||
              state.presentationMode,
            areas: areas.data,
            projectAttributesDiff: {
              admin_publication_attributes: {
                publication_status: publicationStatus,
              },
            },
          };

          if (project && this.props.isProjectFoldersEnabled) {
            newState.folder_id = project.data.attributes.folder_id;
          }

          return newState;
        });
      }
    ),

    project$
      .pipe(
        switchMap((project) => {
          if (project) {
            const headerUrl = project.data.attributes.header_bg.large;
            const projectHeaderImage$ = headerUrl
              ? convertUrlToUploadFileObservable(headerUrl, null, null)
              : of(null);

            const projectFiles$ = project
              ? projectFilesStream(project.data.id).observable.pipe(
                  switchMap((projectFiles) => {
                    if (
                      projectFiles &&
                      projectFiles.data &&
                      projectFiles.data.length > 0
                    ) {
                      return combineLatest(
                        projectFiles.data.map((projectFile) => {
                          const url = projectFile.attributes.file.url;
                          const filename = projectFile.attributes.name;
                          const id = projectFile.id;
                          return convertUrlToUploadFileObservable(
                            url,
                            id,
                            filename
                          );
                        })
                      );
                    }

                    return of([]);
                  })
                )
              : of([]);

            const projectImages$ = project
              ? projectImagesStream(project.data.id).observable.pipe(
                  switchMap((projectImages) => {
                    if (
                      projectImages &&
                      projectImages.data &&
                      projectImages.data.length > 0
                    ) {
                      return combineLatest(
                        projectImages.data
                          .filter((projectImage) => {
                            return !!(
                              projectImage.attributes.versions &&
                              projectImage.attributes.versions.large
                            );
                          })
                          .map((projectImage) => {
                            const url = projectImage.attributes.versions
                              .large as string;
                            return convertUrlToUploadFileObservable(
                              url,
                              projectImage.id,
                              null
                            );
                          })
                      );
                    }

                    return of([]);
                  })
                )
              : of([]);

            return combineLatest([
              processing$,
              projectHeaderImage$,
              projectFiles$,
              projectImages$,
            ]).pipe(
              rxFilter(([processing]) => !processing),
              map(
                ([
                  _processing,
                  projectHeaderImage,
                  projectFiles,
                  projectImages,
                ]) => ({
                  projectHeaderImage,
                  projectFiles,
                  projectImages,
                })
              )
            );
          }

          return of({
            projectHeaderImage: null,
            projectFiles: [],
            projectImages: [],
          });
        })
      )
      .subscribe(({ projectHeaderImage, projectFiles, projectImages }) => {
        this.setState({
          projectFiles: projectFiles
            ? (projectFiles.filter(
                (file) => !isNilOrError(file)
              ) as UploadFile[])
            : [],
          projectImages: projectImages
            ? (projectImages.filter(
                (image) => !isNilOrError(image)
              ) as UploadFile[])
            : [],
          projectHeaderImage: projectHeaderImage ? [projectHeaderImage] : null,
        });
      }),

    processing$.subscribe((processing) => {
      this.setState({ processing });
    }),
  ];
}
