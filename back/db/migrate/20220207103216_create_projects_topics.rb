class CreateProjectsTopics < ActiveRecord::Migration[6.1]
  def change
    create_table :projects_topics, id: :uuid do |t|
      t.references(:topic, null: false, index: true, foreign_key: true, type: :uuid)
      t.references(:project, null: false, index: true, foreign_key: true, type: :uuid)

      t.timestamps
    end
  end
end
