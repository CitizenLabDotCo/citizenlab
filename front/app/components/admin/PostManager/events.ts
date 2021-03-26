export interface StatusChangeModalOpen {
  initiativeId: string;
  newStatusId: string;
}

enum ModalEvents {
  statusChangeModalOpen = 'initiatiateStatusChange',
}

export default ModalEvents;
