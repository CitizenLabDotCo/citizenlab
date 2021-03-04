FactoryBot.define do
  factory :idea do
    title_multiloc {{
      "en" => "Plant more trees",
      "nl-BE" => "Plant meer bomen"
    }}
    body_multiloc {{
      "en" => "<p>It would improve the air quality!</p>",
      "nl-BE" => "<p>De luchtkwaliteit zou er gevoelig op vooruitgaan!</p>"
    }}
    sequence(:slug) {|n| "plant-more-trees-#{n}"}
    publication_status { "published" }
    budget { 750 }
    proposed_budget { 500 }
    association :project, factory: :continuous_project
    author
    idea_status
    factory :idea_with_topics do
      transient do
        topics_count { 2 }
      end
      after(:create) do |idea, evaluator|
        evaluator.topics_count.times do |i|
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
        evaluator.areas_count.times do |i|
          idea.areas << create(:area)
        end
      end
    end
  end
end
