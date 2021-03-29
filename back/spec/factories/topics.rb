FactoryBot.define do
  factory :topic do
    title_multiloc {{
      "en" => "Health",
      "nl-BE" => "Gezondheid"
    }}
    description_multiloc {{
      "en" => "<p>How are the people feeling?</p><p>What is the expected agespan?</p>",
      "nl-BE" => "<p>Hoe voelen de mensen zich?</p><p>Wat is de levensverwachting?</p>"
    }}
    icon { "medical" }
    code { Topic::DEFAULT_CODES.first }

    factory :topic_nature do
      title_multiloc {{ 'en' => 'Nature' }}
    end

    factory :topic_waste do
      title_multiloc {{ 'en' => 'Waste' }}
    end

    factory :topic_sustainability do
      title_multiloc {{ 'en' => 'Sustainability' }}
    end

    factory :topic_mobility do
      title_multiloc {{ 'en' => 'Mobility' }}
    end

    factory :topic_technology do
      title_multiloc {{ 'en' => 'Technology' }}
    end

    factory :topic_economy do
      title_multiloc {{ 'en' => 'Economy' }}
    end
  end

end
