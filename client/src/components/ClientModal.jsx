import { ClientEditModal } from './ClientEditModal';

export const ClientModal = ({ client, onClose, onSave, onSaveSuccess, onDeleteSuccess }) => {
  const handleSaveSuccess = (msg) => {
    onSaveSuccess?.(msg);
    onClose();
  };

  const handleDeleteSuccess = (msg) => {
    onDeleteSuccess?.(msg);
    onClose();
  };

  if (!client) return null;

  return (
    <ClientEditModal
      client={client}
      onClose={onClose}
      onSaveSuccess={handleSaveSuccess}
      onDeleteSuccess={handleDeleteSuccess}
    />
  );
};

export default ClientModal;
