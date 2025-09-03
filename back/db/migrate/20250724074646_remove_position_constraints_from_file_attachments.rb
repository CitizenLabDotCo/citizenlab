class RemovePositionConstraintsFromFileAttachments < ActiveRecord::Migration[7.1]
  def change
    # TODO: reenable those constraints once the ordering logic has been moved to the
    #   backend. See TAN-5126.
    change_column_null :file_attachments, :position, true

    remove_index :file_attachments,
      %i[attachable_type attachable_id position],
      unique: true,
      name: 'index_file_attachments_on_attachable_and_position'
  end
end
