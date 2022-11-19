# frozen_string_literal: true

class AddUniquenessConstraintToVolunteers < ActiveRecord::Migration[6.1]
  def change
    ActiveRecord::Base.connection.execute(
      # After https://stackoverflow.com/a/12963112/3585671
      <<-SQL.squish
      DELETE FROM volunteering_volunteers to_delete USING (
        SELECT MIN(id::text) AS id, cause_id, user_id
          FROM volunteering_volunteers 
          GROUP BY (cause_id, user_id) HAVING COUNT(*) > 1
        ) keep_from_duplicates
        WHERE to_delete.cause_id = keep_from_duplicates.cause_id
        AND to_delete.user_id = keep_from_duplicates.user_id
        AND to_delete.id::text <> keep_from_duplicates.id
      SQL
    )
    add_index :volunteering_volunteers, %i[cause_id user_id], unique: true
    remove_index :volunteers, name: :index_volunteering_volunteers_on_cause_id
  end
end
