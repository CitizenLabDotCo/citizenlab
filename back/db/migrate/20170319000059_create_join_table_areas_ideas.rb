class CreateJoinTableAreasIdeas < ActiveRecord::Migration[5.0]
  def change
    create_table :areas_ideas, id: false do |t|
      t.references :area, foreign_key: true, type: :uuid, index: true
      t.references :idea, foreign_key: true, type: :uuid, index: true
    end
  end
end
