FactoryBot.define do
  factory :navbar_item do
    type { 'custom' }
    title_multiloc do
      {
        "en" => Faker::Lorem.sentence[0...20],
        "nl-BE" => Faker::Lorem.sentence[0...20]
      }
    end
    visible { false }
    sequence(:ordering) { |n| n }

    association :page
  end
end
