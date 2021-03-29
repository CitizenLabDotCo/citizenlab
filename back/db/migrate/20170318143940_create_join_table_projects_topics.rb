class CreateJoinTableProjectsTopics < ActiveRecord::Migration[5.0]
  def change
    create_table :projects_topics, id: false do |t|
      t.references :project, foreign_key: true, type: :uuid, index: true
      t.references :topic, foreign_key: true, type: :uuid, index: true
    end
  end
end
