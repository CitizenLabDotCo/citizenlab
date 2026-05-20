class AddSchedulingFieldsToAdminPublications < ActiveRecord::Migration[7.2]
  def change
    add_column :admin_publications, :scheduled_status, :string, null: true
    add_column :admin_publications, :scheduled_at, :datetime, null: true

    safety_assured do
      add_reference :admin_publications, :scheduled_by, type: :uuid, foreign_key: { to_table: :users }, null: true
      add_index :admin_publications, %i[scheduled_at scheduled_status],
        where: 'scheduled_status IS NOT NULL',
        name: 'index_admin_publications_on_scheduled_transition'
    end

    add_check_constraint :admin_publications,
      '(scheduled_status IS NULL) = (scheduled_at IS NULL)',
      name: 'scheduled_fields_both_or_neither',
      validate: false
  end
end
