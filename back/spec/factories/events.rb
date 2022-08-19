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
      {
        'en' => 'Vogelstraat 4, around the corner',
        'nl-BE' => 'Vogelstraat 4, om de hoek'
      }
    end
    start_at { '2017-05-01 20:00' }
    end_at { '2017-05-01 22:00' }
  end
end
