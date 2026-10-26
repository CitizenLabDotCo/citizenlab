# frozen_string_literal: true

# No index: a platform has a handful of spaces.
class AddOrderingToSpaces < ActiveRecord::Migration[7.2]
  def change
    add_column :spaces, :ordering, :integer

    reversible do |dir|
      dir.up do
        # Keep the order the admin projects page shows today: oldest first.
        # Safe: it only touches the column added above, on a small table.
        safety_assured do
          execute <<~SQL.squish
            UPDATE spaces SET ordering = ranked.position
            FROM (SELECT id, ROW_NUMBER() OVER (ORDER BY created_at, id) - 1 AS position FROM spaces) ranked
            WHERE spaces.id = ranked.id
          SQL
        end
      end
    end
  end
end
