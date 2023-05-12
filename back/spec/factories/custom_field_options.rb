# frozen_string_literal: true

FactoryBot.define do
  factory :custom_field_option do
    custom_field { create(:custom_field_select) }
    sequence(:key) { |n| "option_#{n}" }
    title_multiloc do
      {
        'en' => 'youth council',
        'fr-BE' => 'conseil des jeunes',
        'nl-BE' => 'jeugdraad'
      }
    end
  end
end
