# frozen_string_literal: true

FactoryBot.define do
  factory :base_idea, class: 'Idea' do
    title_multiloc do
      { 'en' => 'Plant more trees', 'nl-BE' => 'Plant meer bomen' }
    end
    body_multiloc do
      {
        'en' => '<p>It would improve the air quality!</p>',
        'nl-BE' => '<p>De luchtkwaliteit zou er gevoelig op vooruitgaan!</p>'
      }
    end

    publication_status { 'published' }
    idea_status { IdeaStatus.find_by(code: 'proposed') || association(:idea_status_proposed) }
    association :project, factory: :single_phase_ideation_project
  end

  factory :idea, parent: :base_idea do
    author
    sequence(:slug) { |n| "plant-more-trees-#{n}" }

    budget { 750 }
    proposed_budget { 500 }
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

  factory :common_ground_input, parent: :base_idea do
    body_multiloc { {} }

    transient do
      # Common Ground is not transitive, so inputs are associated with only one phase
      phase { association(:common_ground_phase, :ongoing) }
    end

    creation_phase { phase }
    phases { [phase] }
    project { phase.project }
  end

  trait :with_author do
    author
  end
end
