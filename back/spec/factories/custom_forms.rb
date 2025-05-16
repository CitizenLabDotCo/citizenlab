# frozen_string_literal: true

FactoryBot.define do
  factory :custom_form do
    participation_context { create(:single_phase_ideation_project) }
    print_start_multiloc { { 'en' => 'Start' } }
    print_end_multiloc { { 'en' => 'End' } }

    trait :with_default_fields do
      after(:create) do |cf|
        participation_method = cf.participation_context.pmethod
        participation_method.default_fields(cf).reverse_each do |field|
          field.save!
          field.move_to_top
        end
      end
    end
  end
end
