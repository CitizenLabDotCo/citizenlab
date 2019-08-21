FactoryBot.define do
  factory :official_feedback do
    user
    association :post, factory: :idea
    body_multiloc {{
      "en" => "<p>This post has been declared as awesome.</p>",
      "nl-BE" => "<p>Deze post werd als geniaal verklaard.</p>"
    }}
    author_multiloc {{
      "en" => "The city council of Mordor",
      "nl-BE" => "Het stadsbestuur van Moskou"
    }}
  end
end
