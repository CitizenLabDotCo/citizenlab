class CreateBasketsIdeas < ActiveRecord::Migration[5.1]
  def change
    create_table :baskets_ideas, id: :uuid do |t|
      t.references :basket, foreign_key: true, type: :uuid, index: true
      t.references :idea, foreign_key: true, type: :uuid

      t.timestamps
    end
  end
end
