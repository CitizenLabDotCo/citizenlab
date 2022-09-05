import { useState, useEffect } from 'react';
import {
  IModerationsCount,
  moderationsCountStream,
} from '../services/moderations';

interface InputProps {
  isFlagged?: boolean;
}

// This resource hook can have the same query parameters as useModerations
// Only added the part useful for me now.
export default function useModerationsCount(props: InputProps) {
  const [count, setCount] = useState<
    IModerationsCount | undefined | null | Error
  >(undefined);
  const [isFlagged, _setIsFlagged] = useState(props.isFlagged || false);

  useEffect(() => {
    const subscription = moderationsCountStream({
      queryParameters: {
        is_flagged: isFlagged,
      },
    }).observable.subscribe((response) => {
      setCount(response);
    });

    return () => subscription.unsubscribe();
  }, [isFlagged]);

  return count;
}
