# This migration comes from volunteering (originally 20200318220514)
class CreateVolunteers < ActiveRecord::Migration[6.0]
  def change
    create_table :volunteering_volunteers, id: :uuid do |t|
      t.references :cause, foreign_key: {to_table: :volunteering_causes}, type: :uuid, null: false, index: true
      t.references :user, type: :uuid, null: false, index: true

      t.timestamps
    end
  end
end
