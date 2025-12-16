# frozen_string_literal: true

class RenameDefaultToIsDefaultInTopics < ActiveRecord::Migration[7.1]
  def change
    safety_assured { rename_column :topics, :default, :is_default }
  end
end
