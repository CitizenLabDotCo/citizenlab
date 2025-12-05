# frozen_string_literal: true

require 'rails_helper'

describe WebApi::V1::IdeaSerializer do
  context "with 'abbreviated user names' enabled" do
    before { SettingsService.new.activate_feature! 'abbreviated_user_names' }

    let(:jane) { create(:user, first_name: 'Jane', last_name: 'Doe') }
    let(:john) { create(:user, first_name: 'John', last_name: 'Smith') }
    let(:admin) { create(:admin, first_name: 'Thomas', last_name: 'Anderson') }

    it 'abbreviates the author name' do
      jane_idea = create(:idea, author: jane)
      last_name = described_class
        .new(jane_idea, params: { current_user: john })
        .serializable_hash
        .dig(:data, :attributes, :author_name)
      expect(last_name).to eq 'Jane D.'
    end

    it 'does not abbreviate user names for admins' do
      jane_idea = create(:idea, author: jane)
      last_name = described_class
        .new(jane_idea, params: { current_user: admin })
        .serializable_hash
        .dig(:data, :attributes, :author_name)
      expect(last_name).to eq 'Jane Doe'

      admin_idea = create(:idea, author: admin)
      last_name = described_class
        .new(admin_idea, params: { current_user: john })
        .serializable_hash
        .dig(:data, :attributes, :author_name)
      expect(last_name).to eq 'Thomas Anderson'
    end
  end

  context 'when serializing internal comments count of idea' do
    let(:project) { create(:project) }
    let(:idea) { create(:idea, project: project) }

    before do
      create_list(:internal_comment, 2, idea: idea)
      idea.reload
    end

    context 'when current user is nil (visitor)' do
      it 'does not include internal comments count' do
        expect(internal_comments_count_for_current_user(idea, nil)).to be_nil
      end
    end

    context 'when current user is regular user' do
      it 'does not include internal comments count' do
        expect(internal_comments_count_for_current_user(idea, create(:user))).to be_nil
      end
    end

    context "when current user is moderator of idea's project" do
      it 'includes internal comments count' do
        moderator = create(:project_moderator, projects: [project])
        expect(internal_comments_count_for_current_user(idea, moderator)).to eq 2
      end
    end

    context "when current user is moderator, but not of idea's project" do
      it 'does not include internal comments count' do
        moderator = create(:project_moderator, projects: [create(:project)])
        expect(internal_comments_count_for_current_user(idea, moderator)).to be_nil
      end
    end

    context 'when current user is admin' do
      it 'includes internal comments count' do
        expect(internal_comments_count_for_current_user(idea, create(:admin))).to eq 2
      end
    end
  end

  context 'for a proposal' do
    let(:user) { nil }
    let(:proposal) { create(:proposal) }
    let(:result) { described_class.new(proposal, params: { current_user: user }).serializable_hash }

    describe 'expires_at' do
      let(:expire_days_limit) { 5 }

      before { proposal.creation_phase.update!(expire_days_limit: expire_days_limit) }

      it 'returns the sum of expire_days_limit and published_at when published' do
        proposal.update!(publication_status: 'published', published_at: '2024-07-20 20:00')
        expect(result.dig(:data, :attributes, :expires_at)).to eq '2024-07-25 20:00'
      end

      it 'returns nil for draft proposals' do
        proposal.update!(publication_status: 'draft')
        expect(result.dig(:data, :attributes, :expires_at)).to be_nil
      end
    end

    describe 'reacting_threshold' do
      let(:reacting_threshold) { 5 }

      before { proposal.creation_phase.update!(reacting_threshold: reacting_threshold) }

      it 'returns the reacting_threshold from the creation phase' do
        proposal.update!(likes_count: 2)
        expect(result.dig(:data, :attributes, :reacting_threshold)).to eq reacting_threshold
      end
    end
  end

  describe 'manual votes' do
    let(:admin) { create(:admin) }
    let(:project) { create(:single_phase_single_voting_project) }
    let(:phase) { project.phases.first }
    let(:params) { { current_user: current_user, phase: phase } }
    let(:input) do
      create(:idea, project: project, phases: project.phases).tap do |idea|
        idea.set_manual_votes(5, admin)
        idea.save!
      end
    end
    let(:result) { described_class.new(input, params: params).serializable_hash }
    let(:current_user) { create(:project_moderator, projects: [project]) }

    before do
      create(:baskets_idea, basket: create(:basket, phase: phase), idea: input, votes: 1)
      create(:baskets_idea, basket: create(:basket, phase: phase), idea: input, votes: 1)
      phase.update!(end_at: phase.start_at + 1.day)
      other_phase = create(:budgeting_phase, project: phase.project, start_at: phase.end_at + 1.day, end_at: phase.end_at + 10.days)
      create(:baskets_idea, basket: create(:basket, phase: other_phase), idea: input, votes: 1)
      Basket.update_counts(phase)
    end

    context 'when the current user moderates the idea' do
      it 'includes who modified the manual votes when' do
        expect(result.dig(:data, :attributes, :manual_votes_amount)).to eq 5
        expect(result.dig(:data, :attributes, :total_votes)).to eq 7
        expect(result.dig(:data, :relationships, :manual_votes_last_updated_by, :data, :id)).to eq admin.id
        expect(result.dig(:data, :attributes, :manual_votes_last_updated_at)).to be_present
      end

      context 'without manual votes' do
        let(:input) { create(:idea, project: project, phases: project.phases) }

        it 'does not include manual votes' do
          expect(result.dig(:data, :attributes, :manual_votes_amount)).to be_nil
          expect(result.dig(:data, :attributes, :total_votes)).to eq 2
          expect(result.dig(:data, :relationships, :manual_votes_last_updated_by, :data, :id)).to be_blank
          expect(result.dig(:data, :attributes, :manual_votes_last_updated_at)).to be_blank
        end
      end

      context 'without phase param' do
        let(:params) { { current_user: current_user } }

        it 'does not include the total votes' do
          expect(result.dig(:data, :attributes, :manual_votes_amount)).to eq 5
          expect(result.dig(:data, :attributes, :total_votes)).to be_nil
          expect(result.dig(:data, :relationships, :manual_votes_last_updated_by, :data, :id)).to eq admin.id
          expect(result.dig(:data, :attributes, :manual_votes_last_updated_at)).to be_present
        end
      end
    end

    context 'when the current user does not moderate the idea' do
      let(:current_user) { create(:project_moderator) }

      it 'does not include who modified the manual votes when' do
        expect(result.dig(:data, :attributes, :manual_votes_amount)).to eq 5
        expect(result.dig(:data, :attributes, :total_votes)).to eq 7
        expect(result.dig(:data, :relationships, :manual_votes_last_updated_by, :data, :id)).to be_blank
        expect(result.dig(:data, :attributes, :manual_votes_last_updated_at)).to be_blank
      end
    end
  end

  def internal_comments_count_for_current_user(idea, current_user)
    described_class
      .new(idea, params: { current_user: current_user })
      .serializable_hash
      .dig(:data, :attributes, :internal_comments_count)
  end
end
