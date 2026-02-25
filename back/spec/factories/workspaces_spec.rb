FactoryBot.define do
  factory :workspace do
    title_multiloc { { 'en' => 'Workspace Title' } }
    description_multiloc { { 'en' => 'Workspace Description' } }
  end
end
