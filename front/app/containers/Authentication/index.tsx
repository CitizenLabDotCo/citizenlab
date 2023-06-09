import React, { useEffect } from 'react';
import SuccessActions from './SuccessActions';
import Modal from './Modal';

// TODO remove
import useExperiments from 'api/experiments/useExperiments';
import useAddExperiment from 'api/experiments/useAddExperiment';

interface Props {
  setModalOpen: (bool: boolean) => void;
}

const Authentication = ({ setModalOpen }: Props) => {
  const { data: experiments } = useExperiments();
  console.log(experiments);

  const { mutate: addExperiment } = useAddExperiment();

  useEffect(() => {
    addExperiment({
      name: 'test_1',
      treatment: 'a',
    });
  }, [addExperiment]);

  return (
    <>
      <SuccessActions />
      <Modal setModalOpen={setModalOpen} />
    </>
  );
};

export default Authentication;
