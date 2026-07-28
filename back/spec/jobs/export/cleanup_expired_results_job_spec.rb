# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Export::CleanupExpiredResultsJob do
  it 'destroys expired result files and keeps fresh ones' do
    expired = create(:export_result_file, expires_at: 1.hour.ago)
    fresh = create(:export_result_file)

    described_class.perform_now

    expect { expired.reload }.to raise_error(ActiveRecord::RecordNotFound)
    expect(fresh.reload).to be_present
  end
end
