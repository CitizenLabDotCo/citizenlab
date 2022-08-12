# frozen_string_literal: true

FactoryBot.define do
  factory :custom_page do
    # Use database defaults for now
    title_multiloc do
      {
        'en' => 'My amazing custom page',
        'nl-BE' => 'Mijn geweldige aangepaste pagina'
      }
    end
    bottom_info_section_multiloc do
      {
        'en' => 'My amazing custom page info section',
        'nl-BE' => 'Mijn geweldige aangepaste pagina informatie sectie'
      }
    end
    sequence(:slug) { |n| "#{Faker::Internet.slug.parameterize}-#{n}".tr('_', '-') }
  end
end
