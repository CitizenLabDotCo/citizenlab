# frozen_string_literal: true

FactoryBot.define do
  factory :idea do
    title_multiloc do
      {
        'en' => 'Plant more trees',
        'nl-BE' => 'Plant meer bomen'
      }
    end
    body_multiloc do
      {
        'en' => '<p>It would improve the air quality!</p>',
        'nl-BE' => '<p>De luchtkwaliteit zou er gevoelig op vooruitgaan!</p>'
      }
    end
    sequence(:slug) { |n| "plant-more-trees-#{n}" }
    publication_status { 'published' }
    budget { 750 }
    proposed_budget { 500 }
    project { phases.present? ? phases.first.project : association(:single_phase_ideation_project) }
    author
    idea_status
    location_point_geojson { { 'type' => 'Point', 'coordinates' => [51.11520776293035, 3.921154106874878] } }
    location_description { 'Some road' }

    after(:create) do |idea|
      idea.phases = idea.project.phases.select { |phase| phase.participation_method == 'ideation' } if idea.phases.empty?
    end

    factory :idea_with_topics do
      transient do
        topics_count { 2 }
      end
      after(:create) do |idea, evaluator|
        evaluator.topics_count.times do |_i|
          topic = create(:topic)
          idea.project.allowed_input_topics << topic
          idea.topics << topic
        end
      end
    end

    factory :proposal, class: 'Idea' do
      association :project, factory: :single_phase_proposals_project
      creation_phase { project.phases.first }
      after(:create) do |idea|
        idea.phases = [idea.creation_phase] if idea.phases.empty?
      end
    end

    factory :native_survey_response, class: 'Idea' do
      association :project, factory: :single_phase_native_survey_project
      creation_phase { project.phases.first }
      idea_status { nil }
      after(:create) do |idea|
        idea.phases = [idea.creation_phase] if idea.phases.empty?
      end
    end
  end
end
