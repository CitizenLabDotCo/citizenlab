FactoryBot.define do
  factory :idea_status do
    title_multiloc {{
      "en" => "At the mayor",
      "nl" => "Bij de burgemeester"
    }}
    ordering 2
    code "custom"
    color "#AABBCC"
    description_multiloc {{
      "en" => "This idea has been presented to the mayor",
      "nl" => "Het idee werd voorgesteld aan de burgemeester"
    }}
  end
end
