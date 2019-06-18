class CreateInitiativeStatuses < ActiveRecord::Migration[5.2]
  def change
    create_table :initiative_statuses, id: :uuid do |t|
      t.jsonb :title_multiloc
      t.jsonb :description_multiloc
      t.integer :ordering
      t.string :code
      t.string :color

      t.timestamps
    end

    add_reference :initiatives, :initiative_status, foreign_key: true, type: :uuid
  end
end
