class CreateFilePreviews < ActiveRecord::Migration[7.1]
  def change
    create_table :files_previews, id: :uuid do |t|
      t.string :content
      t.references :file, null: false, foreign_key: true, type: :uuid
      t.string :status, default: 'pending'

      t.timestamps
    end
  end
end
