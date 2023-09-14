# frozen_string_literal: true

class CreateEventsAttendances < ActiveRecord::Migration[7.0]
  def change
    create_table :events_attendances, id: :uuid do |t|
      t.references :attendee, null: false, foreign_key: { to_table: :users }, type: :uuid, index: true
      t.references :event, null: false, foreign_key: true, type: :uuid, index: true

      t.timestamps index: true
      t.index %i[attendee_id event_id], unique: true
    end
  end
end
