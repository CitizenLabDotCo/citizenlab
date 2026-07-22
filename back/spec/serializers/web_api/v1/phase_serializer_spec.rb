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

  # The raw `prescreening_mode` is configuration data, serialized verbatim;
  # `effective_prescreening_mode` is what the platform's features actually permit, so the
  # front end can rely on it without duplicating the flag logic. Which modes are effective
  # under which flags is specced in phase_spec.rb.
  # A proposals phase, since its `prescreening` feature is enabled by default and the
  # mode is therefore effective without any flag setup.
  context 'for a phase with a prescreening mode' do
    let(:user) { create(:user) }
    let(:phase) { create(:proposals_phase, prescreening_mode: 'all') }

    it 'includes both the configured and the effective mode' do
      expect(result.dig(:data, :attributes, :prescreening_mode)).to eq 'all'
      expect(result.dig(:data, :attributes, :effective_prescreening_mode)).to eq 'all'
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
