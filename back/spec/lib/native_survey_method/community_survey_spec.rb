# frozen_string_literal: true

require 'rails_helper'

RSpec.describe NativeSurveyMethod::CommunityMonitor do
  subject(:native_survey_method) { described_class.new phase }

  let(:phase) { build(:community_monitor_native_survey_phase) }

  describe '#logic_enabled?' do
    it 'is enabled' do
      native_survey_method.logic_enabled?
      expect(native_survey_method.logic_enabled?).to be false
    end
  end

  # TODO: JS: Add more tests when we know what fields and defaults we want to set
end
