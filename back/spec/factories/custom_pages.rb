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
    slug { 'my-amazing-custom-page' }
  end
end
