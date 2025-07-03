# frozen_string_literal: true

class CreateFilesAttachments < ActiveRecord::Migration[7.0]
  def change
    create_table :file_attachments, id: :uuid do |t|
      t.references :file, null: false, foreign_key: { to_table: :files }, type: :uuid, index: true
      t.references :attachable, null: false, polymorphic: true, type: :uuid, index: true
      t.integer :position, null: false

      t.timestamps
    end

    # 'position' is unique per attachable.
    add_index :file_attachments,
      %i[attachable_type attachable_id position],
      unique: true,
      name: 'index_file_attachments_on_attachable_and_position'

    # A file can only be attached once to a given attachable.
    add_index :file_attachments,
      %i[file_id attachable_type attachable_id],
      unique: true,
      name: 'index_file_attachments_on_file_and_attachable'
  end
end
