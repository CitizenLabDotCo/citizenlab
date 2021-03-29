class AddBasketCounterCacheToIdeas < ActiveRecord::Migration[5.1]
  def change
  	add_column :ideas, :baskets_count, :integer, null: false, default: 0
  end
end
