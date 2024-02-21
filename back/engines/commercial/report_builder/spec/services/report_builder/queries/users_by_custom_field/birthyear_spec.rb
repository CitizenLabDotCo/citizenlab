# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ReportBuilder::Queries::UsersByCustomField::Gender do
  subject(:query) { described_class.new(build(:admin)) }

  describe '#run_query' do
    let(:date) { Date.new(2022, 9, 1) }

    before do
      options = [
        build(:custom_field_option, key: :female),
        build(:custom_field_option, key: :other)
      ]
      create(:custom_field, key: :gender, options: options, input_type: :select)

      create(:user, registration_completed_at: date, custom_field_values: { gender: :female })
    end

    it 'returns users by gender' do
      params = { start_at: date - 1.day, end_at: date + 1.day }
      expect(query.run_query(params)).to eq({ '_blank' => 0, 'female' => 1, 'other' => 0 })
    end
  end
end
