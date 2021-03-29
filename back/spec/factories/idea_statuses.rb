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

    factory :idea_status_viewed do
      code { 'viewed' }
      title_multiloc { {'en' => 'viewed'} }
    end

    factory :idea_status_under_consideration do
      code { 'under_consideration' }
      title_multiloc { {'en' => 'under_consideration'} }
    end

    factory :idea_status_accepted do
      code { 'accepted' }
      title_multiloc { {'en' => 'accepted'} }
    end

    factory :idea_status_rejected do
      code { 'rejected' }
      title_multiloc { {'en' => 'rejected'} }
    end

    factory :idea_status_implemented do
      code { 'implemented' }
      title_multiloc { {'en' => 'implemented'} }
    end
  end
end
