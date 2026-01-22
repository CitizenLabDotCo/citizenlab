# frozen_string_literal: true

FactoryBot.define do
  factory :projects_global_topic, aliases: [:projects_topic], class: 'ProjectsGlobalTopic' do
    global_topic
    project
  end
end
