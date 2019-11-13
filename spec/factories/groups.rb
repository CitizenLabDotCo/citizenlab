FactoryBot.define do
  factory :group do
    sequence(:title_multiloc) {|n| {
      "en" => "Martians #{n}",
      "nl-BE" => "Marsmannen #{n}"
    }}
    membership_type { 'manual' }

    factory :smart_group do
      membership_type { 'rules' }
      rules {[
        {ruleType: 'email', predicate: 'ends_on', value: 'test.com'}
      ]}
    end
  end
end
