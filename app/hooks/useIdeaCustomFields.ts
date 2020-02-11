import { useState, useEffect } from 'react';
import { BehaviorSubject, of } from 'rxjs';
import shallowCompare from 'utils/shallowCompare';
import { distinctUntilChanged, switchMap } from 'rxjs/operators';
import { ideaCustomFieldsStream, IIdeaCustomFields } from 'services/ideaCustomFields';

interface Props {
  projectId: string;
}

export default function useIdeaCustomFields(props: Props) {
  const props$ = new BehaviorSubject<Props>(props);
  const [ideaCustomFields, setIdeaCustomFields] = useState<IIdeaCustomFields | undefined | null | Error>(undefined);

  useEffect(() => {
    props$.next(props);
  }, [props]);

  useEffect(() => {
    const subscription = props$.pipe(
      distinctUntilChanged((prev, next) => shallowCompare(prev, next)),
      switchMap(props => props.projectId ? ideaCustomFieldsStream(props.projectId).observable : of(null))
    ).subscribe((ideaCustomFields) => {
      setIdeaCustomFields(ideaCustomFields);
    });

    return () => subscription.unsubscribe();
  }, []);

  return ideaCustomFields;
}
