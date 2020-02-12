import { useState, useEffect } from 'react';
import { BehaviorSubject, of } from 'rxjs';
import shallowCompare from 'utils/shallowCompare';
import { distinctUntilChanged, switchMap } from 'rxjs/operators';
import { ideaCustomFieldsSchemasStream, IIdeaCustomFieldsSchemas } from 'services/ideaCustomFields';

interface Props {
  projectId: string;
}

export default function useIdeaCustomFieldsSchemas(props: Props) {
  const props$ = new BehaviorSubject<Props>(props);
  const [ideaCustomFieldsSchemas, setIdeaCustomFieldsSchemas] = useState<IIdeaCustomFieldsSchemas | undefined | null | Error>(undefined);

  useEffect(() => {
    props$.next(props);
  }, [props]);

  useEffect(() => {
    const subscription = props$.pipe(
      distinctUntilChanged((prev, next) => shallowCompare(prev, next)),
      switchMap(props => props.projectId ? ideaCustomFieldsSchemasStream(props.projectId).observable : of(null))
    ).subscribe((ideaCustomFieldsSchemas) => {
      setIdeaCustomFieldsSchemas(ideaCustomFieldsSchemas);
    });

    return () => subscription.unsubscribe();
  }, []);

  return ideaCustomFieldsSchemas;
}
