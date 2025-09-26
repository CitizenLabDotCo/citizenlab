class CreateInvitesImports < ActiveRecord::Migration[7.1]
  def change
    create_table :invites_imports, id: :uuid do |t|
      t.string :job_type
      t.jsonb :result, default: {}
      t.datetime :completed_at
      t.references :importer, foreign_key: { to_table: :users }, type: :uuid

      t.timestamps
    end
  end
end
