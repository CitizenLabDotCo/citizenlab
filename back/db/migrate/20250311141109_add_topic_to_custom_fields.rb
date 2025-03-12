# frozen_string_literal: true

class AddTopicToCustomFields < ActiveRecord::Migration[7.1]
  def change
    add_reference :custom_fields, :topic, foreign_key: { to_table: :topics }, type: :uuid, index: true
  end
end
