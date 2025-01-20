FactoryBot.define do
  factory :custom_field_matrix_statement do
    custom_field
    sequence(:key) { |n| "statement_#{n}" }
    title_multiloc do
      {
        'en' => 'We should send more animals into space'
      }
    end
  end
end
