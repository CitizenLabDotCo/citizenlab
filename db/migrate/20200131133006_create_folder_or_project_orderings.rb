class CreateFolderOrProjectOrderings < ActiveRecord::Migration[6.0]
  def change
    create_table :folder_or_project_orderings, id: :uuid do |t|
      t.integer :ordering
      t.uuid :containable_id
      t.string  :containable_type
    end
  end
end
