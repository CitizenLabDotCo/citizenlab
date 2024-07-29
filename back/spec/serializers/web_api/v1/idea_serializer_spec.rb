# frozen_string_literal: true

require 'rails_helper'

describe WebApi::V1::IdeaSerializer do
  context "with 'abbreviated user names' enabled" do
    before { SettingsService.new.activate_feature! 'abbreviated_user_names' }

    let(:jane) { create(:user, first_name: 'Jane', last_name: 'Doe') }
    let(:john) { create(:user, first_name: 'John', last_name: 'Smith') }
    let(:admin) { create(:admin, first_name: 'Thomas', last_name: 'Anderson') }

    it 'should abbreviate the author name' do
      jane_idea = create(:idea, author: jane)
      last_name = described_class
        .new(jane_idea, params: { current_user: john })
        .serializable_hash
        .dig(:data, :attributes, :author_name)
      expect(last_name).to eq 'Jane D.'
    end

    it 'should not abbreviate user names for admins' do
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
      create_list(:internal_comment, 2, post: idea)
      idea.reload
    end

    context 'when current user is nil (visitor)' do
      it 'should not include internal comments count' do
        expect(internal_comments_count_for_current_user(idea, nil)).to be_nil
      end
    end

    context 'when current user is regular user' do
      it 'should not include internal comments count' do
        expect(internal_comments_count_for_current_user(idea, create(:user))).to be_nil
      end
    end

    context "when current user is moderator of idea's project" do
      it 'should include internal comments count' do
        moderator = create(:project_moderator, projects: [project])
        expect(internal_comments_count_for_current_user(idea, moderator)).to eq 2
      end
    end

    context "when current user is moderator, but not of idea's project" do
      it 'should not include internal comments count' do
        moderator = create(:project_moderator, projects: [create(:project)])
        expect(internal_comments_count_for_current_user(idea, moderator)).to be_nil
      end
    end

    context 'when current user is admin' do
      it 'should include internal comments count' do
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

    describe 'reactions_needed' do
      let(:reacting_threshold) { 5 }

      before { proposal.creation_phase.update!(reacting_threshold: reacting_threshold) }

      it 'returns the difference between reacting_threshold and likes_count' do
        proposal.update!(likes_count: 2)
        expect(result.dig(:data, :attributes, :reactions_needed)).to eq 3
      end

      it 'returns 0 if the difference is negative' do
        proposal.update!(likes_count: 10)
        expect(result.dig(:data, :attributes, :reactions_needed)).to eq 0
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
