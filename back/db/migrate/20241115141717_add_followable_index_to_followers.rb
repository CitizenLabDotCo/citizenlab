class AddFollowableIndexToFollowers < ActiveRecord::Migration[7.0]
  def change
    add_index :followers, %i[followable_id followable_type]
  end
end
