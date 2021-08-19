import { useState, useEffect } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { IAvatarData, avatarByIdStream } from 'services/avatars';
import { Observable, of, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

interface Props {
  avatarIds?: string[];
  // limit: the number of avatars shown,
  // you'll get one extra bubble with the remaining count component
  limit?: number;
  // context: extra info if you use the component in a specific context, defaults to platform-wide
  context?: {
    type: 'project' | 'group';
    id: string;
  };
}

export default function useAvatars({ avatarIds, limit, context }: Props) {
  const [avatars, setAvatars] = useState<
    (IAvatarData | Error)[] | undefined | null
  >(undefined);

  useEffect(() => {
    setAvatars(undefined);

    let observable: Observable<(IAvatarData | Error)[] | null> = of(null);

    if (avatarIds && avatarIds.length > 0) {
      observable = combineLatest(
        avatarIds.map((id) =>
          avatarByIdStream(id).observable.pipe(
            map((avatar) => (!isNilOrError(avatar) ? avatar.data : avatar))
          )
        )
      );
    }

    const subscription = observable.subscribe((response) => {
      setAvatars(response);
    });

    return () => subscription.unsubscribe();
  }, [avatarIds]);

  return avatars;
}
