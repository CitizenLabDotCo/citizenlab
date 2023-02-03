# frozen_string_literal: true

namespace :fix_existing_tenants do
  desc 'Fixes inputs assigned to topics not allowed by their projects'
  task allowed_input_topics: [:environment] do |_t, _args|
    Tenant.creation_finalized.each do |tenant|
      puts "Processing tenant #{tenant.host}..."
      tenant.switch do
        Project.all.each do |project|
          IdeasTopic.where(idea: project.ideas).where.not(topic: project.allowed_input_topics).each do |idea_topic|
            puts "  Idea(#{idea_topic.idea_id}) -> Topic(#{idea_topic.topic_id})"
            idea_topic.destroy!
          end
        end
      end
    end
  end
end
