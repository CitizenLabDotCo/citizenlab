class CreateInitiativeStatusChanges < ActiveRecord::Migration[5.2]
  def change
    create_table :initiative_status_changes, id: :uuid do |t|
      t.references :user, type: :uuid
      t.references :initiative, type: :uuid, index: true
      t.references :initiative_status, type: :uuid
      t.references :official_feedback, type: :uuid

      t.timestamps
    end
  end
end
