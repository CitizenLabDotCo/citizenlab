# frozen_string_literal: true

class RemoveCodeFromTopics < ActiveRecord::Migration[7.1]
  def change
    # Add the default column first (before removing code)
    add_column :topics, :default, :boolean, default: false, null: false

    # Set default to true for all topics that were not "custom"
    # (i.e., they were predefined/system topics)
    reversible do |dir|
      dir.up do
        safety_assured do
          execute <<-SQL.squish
            UPDATE topics SET "default" = TRUE WHERE code != 'custom'
          SQL
        end
      end
    end

    # Remove the code column
    safety_assured { remove_column :topics, :code, :string, null: false, default: 'custom' }
  end
end
