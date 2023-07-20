# frozen_string_literal: true

class AddFollowersCountToProjects < ActiveRecord::Migration[7.0]
  def change
    add_column :projects, :followers_count, :integer, null: false, default: 0
  end
end
