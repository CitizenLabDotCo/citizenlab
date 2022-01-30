class AddOrderingToProjectsTopics < ActiveRecord::Migration[6.0]
  class StubProjectsTopic < ActiveRecord::Base
    self.table_name = 'projects_topics'
  end

  def up
    add_timestamps :projects_topics
    add_column :projects_topics, :ordering, :integer

    StubProjectsTopic.order(:created_at).each.with_index do |projects_topic, index|
      projects_topic.update_column :ordering, index
    end
  end

  def down
    remove_timestamps :projects_topics
    remove_column :projects_topics, :ordering, :integer
  end
end
