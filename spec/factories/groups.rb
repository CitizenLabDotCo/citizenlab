FactoryBot.define do
  factory :group do
    title_multiloc {{
      "en" => "Martians",
      "nl" => "Marsmannen"
    }}
    membership_type 'manual'

    factory :smart_group do
      membership_type 'rules'
      rules [
        {ruleType: 'email', predicate: 'ends_on', value: 'test.com'}
      ]
    end
  end
end
