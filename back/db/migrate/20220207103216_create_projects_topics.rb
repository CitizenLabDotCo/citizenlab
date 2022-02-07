class CreateProjectsTopics < ActiveRecord::Migration[6.1]
  def change
    create_table :projects_topics, id: :uuid do |t|
      t.uuid :project_id
      t.uuid :topic_id
      t.integer :ordering

      t.timestamps

      t.index :project_id, name: 'index_projects_topics_on_project_id'
      t.index :topic_id, name: 'index_projects_topics_on_topic_id'
    end
  end
end
