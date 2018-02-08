FactoryBot.define do
  factory :idea do
    title_multiloc {{
      "en" => "Plant more trees",
      "nl" => "Plant meer bomen"
    }}
    body_multiloc {{
      "en" => "<p>It would improve the air quality!</p>",
      "nl" => "<p>De luchtkwaliteit zou er gevoelig op vooruitgaan!</p>"
    }}
    publication_status "published"
    association :project, factory: :continuous_project
    author
    idea_status
    factory :idea_with_topics do
      transient do
        topics_count 2
      end
      after(:create) do |idea, evaluator|
        evaluator.topics_count.times do |i|
          idea.topics << create(:topic)
        end
      end
    end

    factory :idea_with_areas do
      transient do
        areas_count 2
      end
      after(:create) do |idea, evaluator|
        evaluator.areas_count.times do |i|
          idea.areas << create(:area)
        end
      end
    end
  end
end
