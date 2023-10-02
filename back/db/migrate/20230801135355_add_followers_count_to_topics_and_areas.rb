# frozen_string_literal: true

class AddFollowersCountToTopicsAndAreas < ActiveRecord::Migration[7.0]
  def change
    %i[topics areas].each do |table|
      add_column table, :followers_count, :integer, null: false, default: 0
    end
  end
end
