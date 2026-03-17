FactoryBot.define do
  factory :space do
    title_multiloc { { 'en' => 'Space Title' } }
    description_multiloc { { 'en' => 'Space Description' } }

    trait :with_projects do
      after(:create) do |space|
        create_list(:project, 2, space: space)
      end
    end
  end
end
