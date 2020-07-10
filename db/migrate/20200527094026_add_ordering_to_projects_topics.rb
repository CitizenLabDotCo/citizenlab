class AddOrderingToProjectsTopics < ActiveRecord::Migration[6.0]
  def change
    add_timestamps :projects_topics
    add_column :projects_topics, :ordering, :integer

    ProjectsTopic.order(:created_at).each.with_index do |projects_topic, index|
      projects_topic.update_column :ordering, index
    end
  end
end
