# frozen_string_literal: true

FactoryBot.define do
  factory :nav_bar_item do
    code { 'custom' }
    title_multiloc do
      {
        'en' => 'Party pictures',
        'nl-BE' => 'Feestfotos'
      }
    end
    static_page

    # A dropdown ('menu') item: a title-only parent with no target.
    trait :menu do
      code { 'menu' }
      title_multiloc { { 'en' => 'Departments' } }
      static_page { nil }
    end
  end
end
