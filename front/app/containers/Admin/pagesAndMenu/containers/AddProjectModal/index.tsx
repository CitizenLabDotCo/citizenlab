import React, { useState } from 'react';

import Modal from 'components/UI/Modal';
import ProjectFilter from 'components/UI/ProjectFilter';

const AddProjectModal = ({ opened, onClose }) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>();
  return (
    <Modal opened={opened} close={onClose}>
      <ProjectFilter
        projectId={selectedProjectId}
        onProjectFilter={(option) => setSelectedProjectId(option.value)}
      />
    </Modal>
  );
};

export default AddProjectModal;
