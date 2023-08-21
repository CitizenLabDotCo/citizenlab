# frozen_string_literal: true

FactoryBot.define do
  factory :event do
    project
    title_multiloc do
      {
        'en' => 'Info session',
        'nl-BE' => 'Info avond'
      }
    end
    description_multiloc do
      {
        'en' => '<p>Be there and learn everything about our future!</p>',
        'nl-BE' => '<p>Kom en ontdek de toekomst!</p>'
      }
    end

    location_multiloc do
      %w[en nl-BE].index_with { |locale| "#{address_1} (#{locale})" }
    end

    address_1 { 'Atomiumsquare 1, 1020 Brussels, Belgium' }
    address_2_multiloc do
      {
        'en' => 'Sphere 1',
        'nl-BE' => 'Bol 1'
      }
    end

    start_at { '2017-05-01 20:00' }
    end_at { '2017-05-01 22:00' }
    sequence(:online_link) { |n| "https://example.com/#{n}" }
  end
end
