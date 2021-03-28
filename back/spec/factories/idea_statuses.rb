FactoryBot.define do
  factory :idea_status do
    title_multiloc {{
      "en" => "At the mayor",
      "nl-BE" => "Bij de burgemeester"
    }}
    ordering { 2 }
    code { "custom" }
    color { "#AABBCC" }
    description_multiloc {{
      "en" => "This idea has been presented to the mayor",
      "nl-BE" => "Het idee werd voorgesteld aan de burgemeester"
    }}

    factory :idea_status_proposed do
      code { 'proposed' }
      title_multiloc { {'en' => 'proposed'} }
    end

    factory :idea_status_accepted do
      code { 'accepted' }
      title_multiloc { {'en' => 'accepted'} }
    end
  end
end
