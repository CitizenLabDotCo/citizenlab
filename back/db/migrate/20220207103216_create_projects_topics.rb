class CreateProjectsTopics < ActiveRecord::Migration[6.1]
  def change
    create_table :projects_topics, id: :uuid do |t|
      t.uuid :project_id, null: false, foreign_key: true, index: true
      t.uuid :topic_id, null: false, foreign_key: true, index: true
      t.integer :ordering

      t.timestamps
    end
  end
end
