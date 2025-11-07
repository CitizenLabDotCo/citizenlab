class AddUniqueIndexToBasketsOnUserAndPhase < ActiveRecord::Migration[7.2]
  def up
    # Remove duplicate baskets, keeping the oldest one for each user+phase combination
    # This handles any existing duplicates before adding the constraint
    execute <<-SQL
      DELETE FROM baskets
      WHERE id IN (
        SELECT id
        FROM (
          SELECT id,
                 ROW_NUMBER() OVER (PARTITION BY user_id, phase_id ORDER BY created_at ASC) AS row_num
          FROM baskets
        ) ranked
        WHERE row_num > 1
      )
    SQL

    # Add unique index to prevent future duplicates
    add_index :baskets, [:user_id, :phase_id], unique: true, name: 'index_baskets_on_user_id_and_phase_id'
  end

  def down
    remove_index :baskets, name: 'index_baskets_on_user_id_and_phase_id'
  end
end
