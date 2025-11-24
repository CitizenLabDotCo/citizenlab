# frozen_string_literal: true

class AddDefaultToTopics < ActiveRecord::Migration[7.1]
  def change
    add_column :topics, :default, :boolean, default: true, null: false
  end
end
