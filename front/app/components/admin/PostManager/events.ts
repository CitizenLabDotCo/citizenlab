export interface StatusChangeModalOpen {
  initiativeId: string;
  newStatusId: string;
  feedbackRequired?: boolean;
}

enum ModalEvents {
  statusChangeModalOpen = 'initiatiateStatusChange',
}

export default ModalEvents;
