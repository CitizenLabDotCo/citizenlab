# frozen_string_literal: true

FactoryBot.define do
  factory :custom_form do
    participation_context { create(:continuous_project) }

    trait :with_default_fields do
      after(:create) do |cf|
        participation_method = Factory.instance.participation_method_for cf.participation_context
        participation_method.default_fields(cf).reverse_each do |field|
          field.save!
          field.move_to_top
        end
      end
    end
  end
end
