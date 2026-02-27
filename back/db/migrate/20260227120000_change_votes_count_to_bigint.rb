  # frozen_string_literal: true

class ChangeVotesCountToBigint < ActiveRecord::Migration[7.1]
  # Since these vote counts are potentially storing the sum of budgets, they can
  # exceed the limit of a 4-byte integer, so we need to change them to bigint.
  def up
    safety_assured do
      change_column :projects, :votes_count, :bigint, default: 0, null: false
      change_column :phases, :votes_count, :bigint, default: 0, null: false
    end
  end

  def down
    safety_assured do
      change_column :projects, :votes_count, :integer, default: 0, null: false
      change_column :phases, :votes_count, :integer, default: 0, null: false
    end
  end
end
