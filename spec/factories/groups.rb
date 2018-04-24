FactoryBot.define do
  factory :group do
    title_multiloc {{
      "en" => "Martians",
      "nl" => "Marsmannen"
    }}
    membership_type 'manual'
  end
end
