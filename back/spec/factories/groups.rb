FactoryBot.define do
  factory :group do
    sequence(:title_multiloc) {|n| {
      "en" => "Martians #{n}",
      "nl-BE" => "Marsmannen #{n}"
    }}
    membership_type { 'manual' }
  end
end
