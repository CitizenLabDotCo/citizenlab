# frozen_string_literal: true

class CreateProjectImports < ActiveRecord::Migration[7.1]
  def change
    create_table :project_imports, id: :uuid do |t|
      t.references :project, foreign_key: true, type: :uuid, index: true
      t.references :import_user, foreign_key: { to_table: :users }, type: :uuid
      t.uuid :import_id
      t.string :log, default: [], array: true
      t.string :locale, :string
      t.timestamps
    end
  end
end
