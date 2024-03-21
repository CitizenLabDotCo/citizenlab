# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ReportBuilder::Queries::UsersByCustomField::Birthyear do
  subject(:query) { described_class.new(build(:admin)) }

  describe '#run_query' do
    let(:date) { Date.new(2022, 9, 1) }

    before do
      options = []
      create(:custom_field, key: :birthyear, options: options, input_type: :select)

      create(:user, registration_completed_at: date, custom_field_values: { birthyear: 1977 })

      AppConfiguration.instance.update!(created_at: date - 2.days)
    end

    it 'returns users by birthyear' do
      params = { start_at: date - 1.day, end_at: date + 1.day }
      expect(query.run_query(**params)).to eq({ '_blank' => 0, 1977 => 1 })
    end
  end
end
