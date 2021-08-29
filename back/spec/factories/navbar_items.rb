FactoryBot.define do
  factory :navbar_item do
    type { 'custom' }
    title_multiloc do
      {
        "en" => Faker::Lorem.sentence,
        "nl-BE" => Faker::Lorem.sentence
      }
    end
    visible { true }
    position { 3 }

    association :page
  end
end
