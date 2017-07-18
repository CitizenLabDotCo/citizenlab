FactoryGirl.define do
  factory :idea_status do
    title_multiloc {{
      "en" => "At the mayor",
      "nl" => "Bij de burgemeester"
    }}
    ordering 2
    code "custom"
    color "#AABBCC"
  end
end
