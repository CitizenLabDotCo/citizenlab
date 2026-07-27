# frozen_string_literal: true

require 'rails_helper'

# The demographics distributions must agree with the product's counter
# (UserCustomFields::FieldValueCounter), which powers the Users dashboard tab
# and the demographics widgets.
RSpec.describe 'reporting_user_question_answers parity with FieldValueCounter' do # rubocop:disable RSpec/DescribeClass
  it 'produces the same distribution as the product demographics counter' do
    field = create(:custom_field_gender, :with_options)
    create_list(:user, 2, custom_field_values: { 'gender' => 'male' })
    create(:user, custom_field_values: { 'gender' => 'female' })
    create(:user) # unanswered

    counts = Analytics::Reporting::UserQuestionAnswer
      .where(question_id: field.id)
      .group(:answer_value)
      .count
    product_counts = UserCustomFields::FieldValueCounter.counts_by_field_option(User.active, field)

    expect(counts).to eq('male' => 2, 'female' => 1)
    expect(product_counts.slice('male', 'female')).to eq('male' => 2, 'female' => 1)
  end
end
