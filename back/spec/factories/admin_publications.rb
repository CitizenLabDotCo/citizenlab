FactoryBot.define do
  factory :admin_publication do
    association :publication, factory: :project
    children_allowed { true }
    publication_status { 'published' }

    trait :with_parent do
      association :parent, factory: :admin_publication
    end

    trait :with_children do
      association :children, factory: :admin_publication
    end
  end
end
