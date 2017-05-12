FactoryGirl.define do
  factory :project do
    title_multiloc {{
      "en" => "Renew West Parc",
      "nl" => "Westpark vernieuwen"
    }}
    description_multiloc {{
      "en" => "<p>Let's renew the parc at the city border and make it an enjoyable place for young and old.</p>",
      "nl" => "<p>Laten we het park op de grend van de stad vernieuwen en er een aangename plek van maken, voor jong en oud.</p>"
    }}

    factory :project_with_topics do
      transient do
        topics_count 5
      end
      after(:create) do |project, evaluator|
        evaluator.topics_count.times do |i|
          project.topics << create(:topic)
        end
      end
    end

    factory :project_with_areas do
      transient do
        areas_count 5
      end
      after(:create) do |project, evaluator|
        evaluator.areas_count.times do |i|
          project.areas << create(:area)
        end
      end
    end
  end
end
