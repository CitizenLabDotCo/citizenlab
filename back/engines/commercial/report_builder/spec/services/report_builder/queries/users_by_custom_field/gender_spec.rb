# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ReportBuilder::Queries::UsersByCustomField::Gender do
  subject(:query) { described_class.new(build(:admin)) }

  describe '#run_query' do
    let(:date) { Date.new(2022, 9, 1) }
    let(:start_at) { (date - 1.day).to_s }
    let(:end_at) { (date + 1.day).to_s }

    before do
      options = [
        build(:custom_field_option, key: :female),
        build(:custom_field_option, key: :other)
      ]
      create(:custom_field, key: :gender, options: options, input_type: :select)

      create(:user, registration_completed_at: date, custom_field_values: { gender: :female })

      AppConfiguration.instance.update!(created_at: date - 2.days)
    end

    it 'returns users by gender' do
      params = { start_at: start_at, end_at: end_at }
      expect(query.run_query(**params)).to eq({ '_blank' => 0, 'female' => 1, 'other' => 0 })
    end

    context 'when end_at is blank' do
      let(:end_at) { '' }

      it 'returns the same users by gender' do
        params = { start_at: start_at, end_at: end_at }
        expect(query.run_query(**params)).to eq({ '_blank' => 0, 'female' => 1, 'other' => 0 })
      end
    end
  end
end
