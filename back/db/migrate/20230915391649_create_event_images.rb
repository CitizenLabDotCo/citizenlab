# frozen_string_literal: true

class CreateEventImages < ActiveRecord::Migration[7.0]
    def change
      create_table :event_images, id: :uuid do |t|
        t.references :event, foreign_key: true, type: :uuid, index: true
        t.string :image
        t.integer :ordering
        t.timestamps
      end
      end
  end
  