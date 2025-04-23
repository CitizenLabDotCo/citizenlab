# frozen_string_literal: true

require 'rails_helper'

describe HeatmapGenerationService do
  let(:service) { described_class.new }

  def set_timezone(timezone) # rubocop:disable Naming/AccessorMethodName
    settings = AppConfiguration.instance.settings
    settings['core']['timezone'] = timezone
    AppConfiguration.instance.update!(settings: settings)
  end

  describe '#create_generate_heatmap_activities' do
    let(:start_hour_utc) { 21 } # Example start hour in UTC

    before do
      stub_env({
        'HEATMAP_CALCULATION_START_HOUR_UTC' => start_hour_utc.to_s
      })
    end

    it 'enqueues Analysis::HeatmapGenerationJob for analyses when current hour matches the start hour' do
      analysis = create(:analysis)
      now = Time.new(2022, 7, 1, start_hour_utc, 0, 0, '+00:00')

      expect { service.create_heatmap_generation_job(now: now) }
        .to have_enqueued_job(Analysis::HeatmapGenerationJob).with(analysis)
    end

    it 'processes analyses in different groups at different hours' do
      analyses = create_list(:analysis, 10) + [create(:analysis)] # Create 11 analyses to distribute across groups

      # Set time to match the second group's hour
      second_group_hour = (start_hour_utc + 1) % 24
      now = Time.new(2022, 7, 1, second_group_hour, 0, 0, '+00:00')

      # Only analyses in group 1 (indices 1, 11, 21, etc.) should be processed
      expect { service.create_heatmap_generation_job(now: now) }
        .to have_enqueued_job(Analysis::HeatmapGenerationJob).with(analyses[1])
      expect { service.create_heatmap_generation_job(now: now) }.not_to have_enqueued_job(Analysis::HeatmapGenerationJob).with(analyses[0])
    end

    it 'does not enqueue any jobs when current hour does not match any processing hour' do
      create(:analysis)

      # Choose an hour that doesn't match any offset hour (assuming fewer than 14 groups)
      non_matching_hour = (start_hour_utc + 15) % 24
      now = Time.new(2022, 7, 1, non_matching_hour, 0, 0, '+00:00')

      expect { service.create_heatmap_generation_job(now: now) }
        .not_to have_enqueued_job(Analysis::HeatmapGenerationJob)
    end
  end
end
