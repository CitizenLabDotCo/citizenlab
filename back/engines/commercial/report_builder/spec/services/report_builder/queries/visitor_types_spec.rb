# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ReportBuilder::Queries::Visitors do
  subject(:query) { described_class.new(build(:user)) }

  describe '#run_query' do
    before_all do
      # Make TimeBoundariesParser work as expected
      AppConfiguration.instance.update!(created_at: Date.new(2021, 1, 1))
    end

    it 'works' do
      expect(query.run_query(**params)).to eq({
        new_visitors: 2,
        returning_visitors: 3
      })
    end
  end
end