class AddUniqueIndexToBasketsUserPhase < ActiveRecord::Migration[7.1]
  def change
    add_index :baskets, %i[user_id phase_id],
      unique: true,
      where: 'user_id IS NOT NULL',
      name: 'index_baskets_on_user_id_and_phase_id_unique'
  end
end
