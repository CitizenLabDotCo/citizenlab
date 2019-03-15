FactoryBot.define do
  factory :official_feedback do
    user
    idea
    body_multiloc {{
      "en" => "<p>This idea has been declared as awesome.</p>",
      "nl-BE" => "<p>Dit idee werd als geniaal verklaard.</p>"
    }}
    author_multiloc {{
      "en" => "The city council of Mordor",
      "nl-BE" => "Het stadsbestuur van Moskou"
    }}
  end
end
