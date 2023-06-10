import { useMemo, useCallback } from 'react';
import useAddExperiment from './useAddExperiment';
import useAuthUser from 'api/me/useAuthUser';

interface ABTestConfig<TreatmentOption extends string> {
  experiment: string;
  treatments: TreatmentOption[];
}

const randomPickFrom = <T>(options: T[]): T => {
  return options[Math.floor(Math.random() * options.length)];
};

const toNumber = (str: string) => {
  let number = 0;

  Array.from(str).forEach((character) => {
    number = number + character.charCodeAt(0);
  });

  return number;
};

// https://github.com/cprosche/mulberry32
function mulberry32(a: number) {
  let t = a + 0x6d2b79f5;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

const pseudoRandomPickFrom = <T>(options: T[], seed: number) => {
  return options[Math.floor(mulberry32(seed) * options.length)];
};

function useABTest<TreatmentOption extends string>({
  experiment,
  treatments,
}: ABTestConfig<TreatmentOption>): {
  treatment: undefined | TreatmentOption;
  send: undefined | ((payload: string) => void);
} {
  const { mutate: addExperiment } = useAddExperiment();
  const { data: authUser, isLoading } = useAuthUser();

  const treatmentsStr = JSON.stringify(treatments);

  const treatment = useMemo(() => {
    if (isLoading) return;
    const treatments: TreatmentOption[] = JSON.parse(treatmentsStr);

    if (authUser) {
      const seed = toNumber(authUser.data.id);
      return pseudoRandomPickFrom(treatments, seed);
    } else {
      return randomPickFrom(treatments);
    }
  }, [authUser, isLoading, treatmentsStr]);

  const send = useCallback(
    (payload: string) => {
      if (!treatment) return;

      addExperiment({
        name: experiment,
        treatment,
        payload,
      });
    },
    [addExperiment, experiment, treatment]
  );

  if (!treatment) {
    return {
      treatment: undefined,
      send: undefined,
    };
  }

  return {
    treatment,
    send,
  };
}

export default useABTest;
