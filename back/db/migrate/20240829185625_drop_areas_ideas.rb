class DropAreasIdeas < ActiveRecord::Migration[7.0]
  def change
    drop_table :areas_ideas
  end
end
