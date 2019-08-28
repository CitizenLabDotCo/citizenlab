class CreateInitiativeStatusChanges < ActiveRecord::Migration[5.2]
  def change
    create_table :initiative_status_changes, id: :uuid do |t|
      t.references :user, type: :uuid
      t.references :initiative, type: :uuid, index: true
      t.references :initiative_status, type: :uuid
      t.references :official_feedback, type: :uuid

      t.timestamps
    end

    migrate_initiative_status_changes

    remove_column :initiatives, :initiative_status_id
  end

  def migrate_initiative_status_changes
    bulk_creations = Initiative.published
      .pluck(:id, :initiative_status_id).map do |initiative_id, status_id|
        {initiative_id: initiative_id, initiative_status_id: status_id}
      end
    InitiativeStatusChange.create! bulk_creations
  end
end
