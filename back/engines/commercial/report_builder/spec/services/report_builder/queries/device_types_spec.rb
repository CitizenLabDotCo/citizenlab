# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ReportBuilder::Queries::DeviceTypes do
  subject(:query) { described_class.new(build(:user)) }

  describe '#run_query' do
    before_all do
      # Make TimeBoundariesParser work as expected
      AppConfiguration.instance.update!(created_at: Date.new(2021, 1, 1))
    end

    it 'works' do
      2.times do
        create(:session, created_at: Date.new(2023, 2, 1), device_type: 'desktop_or_other')
      end

      3.times do
        create(:session, created_at: Date.new(2023, 2, 1), device_type: 'mobile')
      end

      params = {
        start_at: Date.new(2023, 1, 1),
        end_at: Date.new(2023, 3, 1),
      }

      result = query.run_query(**params).to eq({
        counts_per_device_type: {
          'desktop_or_other' => 2,
          'mobile' => 3
        }
      })
    end
  end
end