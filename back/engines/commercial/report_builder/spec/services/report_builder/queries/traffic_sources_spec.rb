# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ReportBuilder::Queries::TrafficSources do
  subject(:query) { described_class.new(build(:user)) }

  describe '#run_query' do
    before_all do
      # Make TimeBoundariesParser work as expected
      AppConfiguration.instance.update!(created_at: Date.new(2021, 1, 1))
    end

    it 'works' do
      expect(query.run_query).to eq({})
    end
  end
end
