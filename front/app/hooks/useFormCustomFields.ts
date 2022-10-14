import { useState, useEffect } from 'react';

import { combineLatest, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import {
  ICustomFieldInputType,
  IFlatCustomField,
  formCustomFieldsStream,
  formCustomFieldOptionStream,
} from '../services/formCustomFields';

interface Props {
  inputTypes?: ICustomFieldInputType[];
  projectId: string;
  phaseId?: string;
}

export default function useFormCustomFields({
  inputTypes,
  projectId,
  phaseId,
}: Props) {
  const [formCustomFields, setFormCustomFields] = useState<
    IFlatCustomField[] | undefined | Error
  >(undefined);

  useEffect(() => {
    const subscription = formCustomFieldsStream(
      projectId,
      {
        queryParameters: { input_types: inputTypes },
      },
      phaseId
    )
      .observable.pipe(
        switchMap((formCustomFieldsResponse) => {
          const fieldsWithOptions$ = formCustomFieldsResponse.data.map(
            ({ id, type, attributes, relationships: { options }, ...rest }) => {
              const options$ = options.data.map(({ id: optionId }) => {
                const optionsStream = formCustomFieldOptionStream(
                  projectId,
                  id,
                  optionId,
                  null,
                  phaseId
                ).observable;

                // Return id and title_multiloc of each option
                return optionsStream.pipe(
                  map((formCustomFieldOption) => {
                    const {
                      id,
                      attributes: { title_multiloc },
                    } = formCustomFieldOption.data;
                    return {
                      id,
                      title_multiloc,
                    };
                  })
                );
              });

              if (options$.length) {
                return combineLatest(options$).pipe(
                  map((options) => ({
                    id,
                    type,
                    ...rest,
                    ...attributes,
                    options,
                  }))
                );
              }
              return of({
                id,
                type,
                ...rest,
                ...attributes,
                relationships: { options },
              });
            }
          );

          return fieldsWithOptions$.length
            ? combineLatest(fieldsWithOptions$)
            : of([]);
        })
      )
      .subscribe((formCustomFields) => {
        setFormCustomFields(formCustomFields);
      });

    return () => subscription.unsubscribe();
  }, [inputTypes, projectId, phaseId]);

  return formCustomFields;
}
