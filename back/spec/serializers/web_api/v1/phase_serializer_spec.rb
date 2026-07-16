# frozen_string_literal: true

require 'rails_helper'

describe WebApi::V1::PhaseSerializer do
  let(:result) { described_class.new(phase, params: { current_user: user }).serializable_hash }

  context 'for a past voting phase' do
    let(:phase) { create(:single_voting_phase, start_at: 5.days.ago, end_at: 1.day.ago, baskets_count: 4, votes_count: 7) }

    context 'when moderator' do
      let(:user) { create(:project_moderator, projects: [phase.project]) }

      it 'includes the baskets_count and votes_count' do
        expect(result.dig(:data, :attributes, :baskets_count)).to eq 4
        expect(result.dig(:data, :attributes, :votes_count)).to eq 7
      end
    end

    context 'when resident' do
      let(:user) { create(:user) }

      it 'includes the baskets_count and votes_count' do
        expect(result.dig(:data, :attributes, :baskets_count)).to eq 4
        expect(result.dig(:data, :attributes, :votes_count)).to eq 7
      end
    end
  end

  context 'for an active voting phase' do
    let(:phase) { create(:single_voting_phase, start_at: 5.days.ago, end_at: 6.days.from_now, baskets_count: 4, votes_count: 7) }

    context 'when moderator' do
      let(:user) { create(:project_moderator, projects: [phase.project]) }

      it 'includes the baskets_count and votes_count' do
        expect(result.dig(:data, :attributes, :baskets_count)).to eq 4
        expect(result.dig(:data, :attributes, :votes_count)).to eq 7
      end
    end

    context 'when resident' do
      let(:user) { create(:user) }

      it 'includes the baskets_count but not the votes_count' do
        expect(result.dig(:data, :attributes, :baskets_count)).to eq 4
        expect(result.dig(:data, :attributes, :votes_count)).to be_nil
      end
    end
  end

  context 'for a future voting phase' do
    let(:phase) { create(:single_voting_phase, start_at: 2.days.from_now, end_at: 6.days.from_now, baskets_count: 4, votes_count: 7) }

    context 'when moderator' do
      let(:user) { create(:project_moderator, projects: [phase.project]) }

      it 'includes the baskets_count and votes_count' do
        expect(result.dig(:data, :attributes, :baskets_count)).to eq 4
        expect(result.dig(:data, :attributes, :votes_count)).to eq 7
      end
    end

    context 'when resident' do
      let(:user) { create(:user) }

      it 'includes the baskets_count but not the votes_count' do
        expect(result.dig(:data, :attributes, :baskets_count)).to eq 4
        expect(result.dig(:data, :attributes, :votes_count)).to be_nil
      end
    end
  end

  context 'for a native survey phase' do
    let(:user) { create(:user) }
    let(:phase) { create(:native_survey_phase, with_permissions: true) }

    it 'includes survey attributes' do
      expect(result.dig(:data, :attributes).keys).to include(
        :native_survey_title_multiloc,
        :native_survey_button_multiloc
      )
      expect(result.dig(:data, :attributes, :supports_survey_form)).to be true
    end
  end

  # The raw `prescreening_mode` is configuration data and is always serialized verbatim;
  # `effective_prescreening_mode` is what the platform's feature flags actually permit,
  # so the front end can rely on it without duplicating the flag logic.
  describe 'effective_prescreening_mode' do
    let(:user) { create(:user) }

    def set_feature_flags(prescreening:, flag_inappropriate_content:)
      AppConfiguration.instance.settings.tap do |settings|
        settings['prescreening'] = { 'allowed' => true, 'enabled' => prescreening }
        settings['prescreening_ideation'] = { 'allowed' => true, 'enabled' => prescreening }
        settings['flag_inappropriate_content'] = { 'allowed' => true, 'enabled' => flag_inappropriate_content }
      end

      AppConfiguration.instance.save!
    end

    context 'when the prescreening feature is enabled' do
      before { set_feature_flags(prescreening: true, flag_inappropriate_content: false) }

      let(:phase) { create(:phase, prescreening_mode: 'all') }

      it 'serializes the configured mode as effective' do
        expect(result.dig(:data, :attributes, :prescreening_mode)).to eq 'all'
        expect(result.dig(:data, :attributes, :effective_prescreening_mode)).to eq 'all'
      end
    end

    context 'when the prescreening feature is disabled' do
      before { set_feature_flags(prescreening: false, flag_inappropriate_content: false) }

      let(:phase) { create(:phase, prescreening_mode: 'all') }

      it 'serializes the configured mode but a nil effective mode' do
        expect(result.dig(:data, :attributes, :prescreening_mode)).to eq 'all'
        expect(result.dig(:data, :attributes, :effective_prescreening_mode)).to be_nil
      end
    end

    context 'when the mode is flagged_only and flag_inappropriate_content is disabled' do
      before { set_feature_flags(prescreening: true, flag_inappropriate_content: false) }

      let(:phase) { create(:phase, prescreening_mode: 'flagged_only') }

      it 'serializes the configured mode but a nil effective mode' do
        expect(result.dig(:data, :attributes, :prescreening_mode)).to eq 'flagged_only'
        expect(result.dig(:data, :attributes, :effective_prescreening_mode)).to be_nil
      end
    end
  end

  context 'for a community monitor phase' do
    let(:user) { create(:user) }
    let(:phase) { create(:community_monitor_survey_phase, with_permissions: true) }

    it 'includes survey attributes' do
      expect(result.dig(:data, :attributes).keys).to include(
        :native_survey_title_multiloc,
        :native_survey_button_multiloc
      )
      expect(result.dig(:data, :attributes, :supports_survey_form)).to be true
    end
  end
end
