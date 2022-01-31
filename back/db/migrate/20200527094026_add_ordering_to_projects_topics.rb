class AddOrderingToProjectsTopics < ActiveRecord::Migration[6.0]
  class StubProjectsTopic < ActiveRecord::Base
    self.table_name = 'projects_topics'
  end

  reversible do |dir|
    dir.up do
      add_timestamps :projects_topics
      add_column :projects_topics, :ordering, :integer

      StubProjectsTopic.order(:created_at).each.with_index do |projects_topic, index|
        projects_topic.update_column :ordering, index
      end
    end

    dir.down do
      remove_column :projects_topics, :ordering
      remove_timestamps :projects_topics
    end
  end
end
