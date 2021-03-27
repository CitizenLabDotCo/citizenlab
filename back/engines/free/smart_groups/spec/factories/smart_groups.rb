FactoryBot.define do
  factory :smart_group, parent: :group do
    membership_type { 'rules' }
    rules do
      [
        { ruleType: 'email', predicate: 'ends_on', value: 'test.com' }
      ]
    end
  end
end
