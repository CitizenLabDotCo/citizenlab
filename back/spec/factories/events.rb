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

    start_at { '2017-05-01 20:00' }
    end_at { '2017-05-01 22:00' }

    trait :with_location do
      location_point { 'POINT(4.351710319519043 50.8465574798584)' }

      address_1 { 'Atomiumsquare 1, 1020 Brussels, Belgium' }
      address_2_multiloc do
        {
          'en' => 'Sphere 1',
          'nl-BE' => 'Bol 1'
        }
      end

      location_multiloc do
        %w[en nl-BE].index_with { |locale| "#{address_1} (#{locale})" }
      end
    end
  end
end
