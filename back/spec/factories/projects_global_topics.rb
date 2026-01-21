# frozen_string_literal: true

FactoryBot.define do
  factory :projects_global_topic, aliases: [:projects_topic], class: 'ProjectsGlobalTopic' do
    global_topic
    project

    # Allow using `topic:` as an alias for `global_topic:`
    transient do
      topic { nil }
    end

    after(:build) do |projects_global_topic, evaluator|
      projects_global_topic.global_topic = evaluator.topic if evaluator.topic
    end
  end
end
