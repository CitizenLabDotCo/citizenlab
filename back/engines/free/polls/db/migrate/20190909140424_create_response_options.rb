# frozen_string_literal: true

class CreateResponseOptions < ActiveRecord::Migration[5.2]
  def change
    create_table :polls_response_options, id: :uuid do |t|
      t.references :response, foreign_key: { to_table: :polls_responses }, type: :uuid, index: true
      t.references :option, foreign_key: { to_table: :polls_options }, type: :uuid, index: true

      t.timestamps
    end
  end
end
