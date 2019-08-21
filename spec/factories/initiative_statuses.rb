FactoryBot.define do
  factory :initiative_status do
    title_multiloc {{
      "en" => "Made Joke cry",
      "nl-BE" => "Deed Joke wenen"
    }}
    ordering { 2 }
    code { "custom" }
    color { "#AABBCC" }
    description_multiloc {{
      "en" => "This initiative has made Joke cry",
      "nl-BE" => "Het initiatief heeft Joke doen wenen"
    }}
  end
end
