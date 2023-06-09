# frozen_string_literal: true

# This migration comes from email_campaigns (originally 20230524162712)

class CreateExperiments < ActiveRecord::Migration[6.1]
  def change
    create_table :experiments, id: :uuid do |t|
      t.string :name, null: false
      t.string :treatment, null: false
      t.string :payload

      t.references :user, type: :uuid, index: true

      t.timestamps
    end
  end
end