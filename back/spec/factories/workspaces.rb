FactoryBot.define do
  factory :workspace do
    title_multiloc { { 'en' => 'Workspace Title' } }
    description_multiloc { { 'en' => 'Workspace Description' } }

    trait :with_projects do
      after(:create) do |workspace|
        create_list(:project, 2, workspace: workspace)
      end
    end
  end
end
