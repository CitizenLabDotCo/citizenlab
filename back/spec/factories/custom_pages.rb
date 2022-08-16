# frozen_string_literal: true

FactoryBot.define do
  factory :custom_page do
    title_multiloc do
      {
        'en' => 'My amazing custom page',
        'nl-BE' => 'Mijn geweldige aangepaste pagina'
      }
    end
    sequence(:slug) { |n| "#{Faker::Internet.slug.parameterize}-#{n}".tr('_', '-') }
  end
end
