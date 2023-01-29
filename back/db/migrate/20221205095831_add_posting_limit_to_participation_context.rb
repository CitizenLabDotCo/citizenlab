# frozen_string_literal: true

class AddPostingLimitToParticipationContext < ActiveRecord::Migration[6.1]
  def change
    %i[projects phases].each do |tablename|
      add_column tablename, :posting_method, :string, null: false, default: 'unlimited'
      add_column tablename, :posting_limited_max, :integer, default: 1
    end
  end
end
