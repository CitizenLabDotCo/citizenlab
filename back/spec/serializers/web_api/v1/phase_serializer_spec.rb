# frozen_string_literal: true

require 'rails_helper'

describe WebApi::V1::PhaseSerializer do
  let(:result) { described_class.new(phase, params: { current_user: user }).serializable_hash }

  context 'for a past voting phase' do
    let(:phase) { create(:single_voting_phase, start_at: Time.zone.today - 5.days, end_at: Time.zone.today - 2.days, baskets_count: 4, votes_count: 7) }

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
    let(:phase) { create(:single_voting_phase, start_at: Time.zone.today - 5.days, end_at: Time.zone.today + 5.days, baskets_count: 4, votes_count: 7) }

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
    let(:phase) { create(:single_voting_phase, start_at: Time.zone.today + 2.days, end_at: Time.zone.today + 5.days, baskets_count: 4, votes_count: 7) }

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
end
