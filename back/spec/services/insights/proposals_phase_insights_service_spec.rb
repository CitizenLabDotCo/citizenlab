require 'rails_helper'

RSpec.describe Insights::ProposalsPhaseInsightsService do
  let(:phase) { create(:proposals_phase, start_at: 15.days.ago, end_at: 2.days.ago) }
  let(:service) { described_class.new(phase) }

  let(:user1) { create(:user) }
  let!(:idea1) { create(:idea, phases: [phase], created_at: 20.days.ago, submitted_at: 20.days.ago, author: user1, creation_phase_id: phase.id) } # before phase start
  let!(:idea2) { create(:idea, phases: [phase], created_at: 10.days.ago, submitted_at: 10.days.ago, author: user1, creation_phase_id: phase.id) } # during phase
  let!(:idea3) { create(:idea, phases: [phase], created_at: 1.day.ago, submitted_at: 1.day.ago, author: user1, creation_phase_id: phase.id) } # after phase end

  let(:user2) { create(:user) }
  let!(:idea4) { create(:idea, phases: [phase], created_at: 10.days.ago, submitted_at: 10.days.ago, published_at: nil, publication_status: 'submitted', author: user2, creation_phase_id: phase.id) } # during phase, submitted but not published
  let!(:idea5) { create(:idea, phases: [phase], created_at: 10.days.ago, submitted_at: 10.days.ago, published_at: nil, author: user2, publication_status: 'draft', creation_phase_id: phase.id) } # during phase, but not submitted nor published

  let!(:idea6) { create(:idea, phases: [phase], created_at: 10.days.ago, submitted_at: 10.days.ago, author: nil, author_hash: 'some_author_hash', creation_phase_id: phase.id) } # during phase, no author (e.g. anonymous participation)
  let!(:idea7) { create(:idea, phases: [phase], created_at: 10.days.ago, submitted_at: 10.days.ago, author: nil, author_hash: nil, creation_phase_id: phase.id) } # during phase, no author nor author_hash (e.g. imported idea)

  let!(:comment1) { create(:comment, idea: idea1, created_at: 20.days.ago, author: user1) } # before phase start
  let!(:comment2) { create(:comment, idea: idea1, created_at: 10.days.ago, author: user1) } # during phase
  let!(:comment3) { create(:comment, idea: idea1, created_at: 1.day.ago, author: user1) } # after phase end

  let!(:comment4) { create(:comment, idea: idea1, created_at: 10.days.ago, author: user2) } # during phase

  let!(:comment5) { create(:comment, idea: idea1, created_at: 10.days.ago, author: nil, author_hash: 'some_author_hash') } # during phase, no author
  let!(:comment6) { create(:comment, idea: idea1, created_at: 10.days.ago, author: nil, author_hash: nil) } # during phase, no author nor author_hash

  let!(:reaction1) { create(:reaction, reactable: idea1, created_at: 20.days.ago, user: user1, mode: 'up') } # before phase start
  let!(:reaction2) { create(:reaction, reactable: idea2, created_at: 10.days.ago, user: user1, mode: 'up') } # during phase
  let!(:reaction3) { create(:reaction, reactable: idea3, created_at: 1.day.ago, user: user1, mode: 'up') } # after phase end

  let!(:reaction4) { create(:reaction, reactable: idea2, created_at: 10.days.ago, user: user2, mode: 'down') } # during phase

  let!(:reaction5) { create(:reaction, reactable: idea1, created_at: 10.days.ago, user: nil, mode: 'up') } # during phase, no user

  describe '#participation_ideas_submitted' do
    it 'returns the participation ideas published data for published ideas published during phase' do
      participation_ideas_submitted = service.send(:participation_ideas_submitted)

      expect(participation_ideas_submitted).to match_array([
        {
          item_id: idea2.id,
          action: 'posting_idea',
          acted_at: a_kind_of(Time),
          classname: 'Idea',
          participant_id: user1.id,
          user_custom_field_values: {}
        },
        {
          item_id: idea4.id,
          action: 'posting_idea',
          acted_at: a_kind_of(Time),
          classname: 'Idea',
          participant_id: user2.id,
          user_custom_field_values: {}
        },
        {
          item_id: idea6.id,
          action: 'posting_idea',
          acted_at: a_kind_of(Time),
          classname: 'Idea',
          participant_id: 'some_author_hash',
          user_custom_field_values: {}
        },
        {
          item_id: idea7.id,
          action: 'posting_idea',
          acted_at: a_kind_of(Time),
          classname: 'Idea',
          participant_id: idea7.id,
          user_custom_field_values: {}
        }
      ])

      first_participation = participation_ideas_submitted.first
      expect(first_participation[:acted_at])
        .to be_within(1.second).of(Idea.find(first_participation[:item_id]).submitted_at)
    end

    it 'correctly handles phases with no end date' do
      phase.update!(end_at: nil)
      participation_ideas_submitted = service.send(:participation_ideas_submitted)

      expect(participation_ideas_submitted.pluck(:item_id)).to match_array([
        idea2.id,
        idea3.id,
        idea4.id,
        idea6.id,
        idea7.id
      ])
    end

    it 'does not include ideas that are not submitted' do
      participation_ideas_submitted = service.send(:participation_ideas_submitted)

      idea_ids = participation_ideas_submitted.map { |p| p[:item_id] }
      expect(idea_ids).not_to include(idea5.id)
    end

    it 'does not include transitive ideas' do
      idea2.creation_phase_id = nil
      idea2.save!(validate: false) # skip validations to allow non-transitive idea
      participation_ideas_submitted = service.send(:participation_ideas_submitted)

      idea_ids = participation_ideas_submitted.map { |p| p[:item_id] }
      expect(idea_ids).not_to include(idea2.id)
    end
  end

  describe '#participations' do
    it 'returns the expected aggregation of sets of participations' do
      participations = service.send(:participations)

      expect(participations).to eq({
        posting_idea: service.send(:participation_ideas_submitted),
        commenting_idea: service.send(:participation_idea_comments),
        reacting_idea: service.send(:participation_idea_reactions)
      })

      expect(participations[:posting_idea].map { |p| p[:item_id] }).to match_array([
        idea2.id,
        idea4.id,
        idea6.id,
        idea7.id
      ])

      expect(participations[:commenting_idea].map { |p| p[:item_id] }).to match_array([
        comment2.id,
        comment4.id,
        comment5.id,
        comment6.id
      ])

      expect(participations[:reacting_idea].map { |p| p[:item_id] }).to match_array([
        reaction2.id,
        reaction4.id,
        reaction5.id
      ])
    end
  end
end
