# frozen_string_literal: true

class AddVotesCountToContext < ActiveRecord::Migration[6.1]
  def change
    %i[ideas projects phases ideas_phases].each do |tablename|
      add_column tablename, :votes_count, :integer, null: false, default: 0
    end
  end
end
