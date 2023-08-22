# frozen_string_literal: true

class AddFollowersCountToFollowables < ActiveRecord::Migration[7.0]
  def change
    %i[projects project_folders_folders initiatives ideas].each do |table|
      add_column table, :followers_count, :integer, null: false, default: 0
    end
  end
end
