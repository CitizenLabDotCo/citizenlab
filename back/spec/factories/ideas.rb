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
    association :project, factory: :continuous_project
    author
    idea_status
    location_point_geojson { { type: 'Point', coordinates: [51.11520776293035, 3.921154106874878] } }
    location_description { 'Some road' }
    factory :idea_with_topics do
      transient do
        topics_count { 2 }
      end
      after(:create) do |idea, evaluator|
        evaluator.topics_count.times do |_i|
          topic = create(:topic)
          idea.project.topics << topic
          idea.topics << topic
        end
      end
    end

    factory :idea_with_areas do
      transient do
        areas_count { 2 }
      end
      after(:create) do |idea, evaluator|
        evaluator.areas_count.times do |_i|
          idea.areas << create(:area)
        end
      end
    end
  end
end
