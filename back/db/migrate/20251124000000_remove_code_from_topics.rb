# frozen_string_literal: true

class RemoveCodeFromTopics < ActiveRecord::Migration[7.1]
  def change
    safety_assured { remove_column :topics, :code, :string, null: false, default: 'custom' }
  end
end
