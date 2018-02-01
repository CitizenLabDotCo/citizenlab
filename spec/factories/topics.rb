FactoryBot.define do
  factory :topic do
    title_multiloc {{
      "en" => "Health",
      "nl" => "Gezondheid"
    }}
    description_multiloc {{
      "en" => "<p>How are the people feeling?</p><p>What is the expected agespan?</p>",
      "nl" => "<p>Hoe voelen de mensen zich?</p><p>Wat is de levensverwachting?</p>"
    }}
    icon "medical"
  end
end
