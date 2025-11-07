class AddUniqueIndexToBasketsOnUserAndPhase < ActiveRecord::Migration[7.2]
  def up
    # Remove duplicate baskets, keeping the oldest one for each user+phase combination
    # IMPORTANT: Only remove duplicates where user_id IS NOT NULL
    # Baskets with NULL user_id (deleted users) are all kept to preserve voting history
    execute <<-SQL.squish
      DELETE FROM baskets
      WHERE id IN (
        SELECT id
        FROM (
          SELECT id,
                 ROW_NUMBER() OVER (PARTITION BY user_id, phase_id ORDER BY created_at ASC) AS row_num
          FROM baskets
          WHERE user_id IS NOT NULL
        ) ranked
        WHERE row_num > 1
      )
    SQL

    # Add unique index to prevent future duplicates
    # Note: PostgreSQL unique indexes allow multiple NULL values, so deleted users' baskets are preserved
    add_index :baskets, %i[user_id phase_id], unique: true, name: 'index_baskets_on_user_id_and_phase_id'
  end

  def down
    remove_index :baskets, name: 'index_baskets_on_user_id_and_phase_id'
  end
end
