# frozen_string_literal: true

require 'rails_helper'

describe Ideas::CopyService do
  subject(:service) { described_class.new }

  let(:dest_phase) { create(:phase) }

  before_all do
    create(:idea_status_proposed)
  end

  context 'when the destination phase participation_method is transitive' do
    let(:dest_phase) { create(:ideation_phase) }

    it 'removes the creation_phase_id' do
      source_phase = create(:common_ground_phase)
      idea = create(:idea, creation_phase_id: source_phase.id, phases: [source_phase], project: source_phase.project)
      service.copy([idea], dest_phase, nil)
      expect(dest_phase.ideas.sole.creation_phase_id).to be_nil
    end
  end

  context 'when the destination phase participation_method is not transitive' do
    let(:dest_phase) { create(:common_ground_phase) }

    it 'sets the creation_phase_id to the destination phase' do
      idea = create(:idea)
      service.copy([idea], dest_phase, nil)
      expect(dest_phase.ideas.sole.creation_phase_id).to eq(dest_phase.id)
    end
  end

  it 'copies ideas' do
    ideas = [
      create(:idea, publication_status: 'submitted'),
      create(:idea, publication_status: 'published')
    ]

    summary = service.copy(ideas, dest_phase, nil)

    expect(dest_phase.ideas.count).to eq(2)
    expect(summary.count).to eq(2)
    expect(summary.errors).to be_empty
  end

  it 'creates a RelatedIdea record for each copied idea' do
    idea = create(:idea)
    service.copy([idea], dest_phase, nil)
    expect(RelatedIdea.where(idea: dest_phase.ideas.sole, related_idea: idea)).to exist
  end

  it "replaces the 'submitted' publication status by 'published'" do
    idea = create(:idea, publication_status: 'submitted')
    service.copy([idea], dest_phase, nil)
    expect(dest_phase.ideas.sole.publication_status).to eq('published')
  end

  it 'discards the custom field values' do
    idea = create(:idea, custom_field_values: { 'foo' => 'bar' })
    service.copy([idea], dest_phase, nil)
    expect(dest_phase.ideas.sole.custom_field_values).to be_empty
  end

  it 'preserves the title and the body' do
    idea = create(
      :idea,
      title_multiloc: { 'en' => 'foo', 'nl-BE' => 'foo' },
      body_multiloc: { 'en' => 'bar' }
    )

    service.copy([idea], dest_phase, nil)

    copy = dest_phase.ideas.sole
    expect(copy.title_multiloc).to eq(idea.title_multiloc)
    expect(copy.body_multiloc).to eq(idea.body_multiloc)
  end

  it 'raises an error if one of the ideas is in draft' do
    ideas = [
      create(:idea, publication_status: 'draft'),
      create(:idea, publication_status: 'published')
    ]

    expect { service.copy(ideas, dest_phase, nil) }
      .to raise_error(Ideas::CopyService::IdeaCopyNotAllowedError)
      .with_message('cannot_copy_draft_ideas')
  end

  it 'raises an error if one of the ideas is a native survey response' do
    ideas = [
      create(:native_survey_response),
      create(:idea, publication_status: 'published')
    ]

    expect { service.copy(ideas, dest_phase, nil) }
      .to raise_error(Ideas::CopyService::IdeaCopyNotAllowedError)
      .with_message('cannot_copy_native_survey_responses')
  end

  it "replaces the original idea status with 'proposed'" do
    idea = create(:idea)
    expect(idea.idea_status.code).not_to eq('proposed')

    service.copy([idea], dest_phase, nil)

    expect(dest_phase.ideas.sole.idea_status.code).to eq('proposed')
  end

  it 'copies have different ids than the original' do
    idea = create(:idea)
    service.copy([idea], dest_phase, nil)
    expect(dest_phase.ideas.sole.id).not_to eq(idea.id)
  end

  it 'does not copy associations' do
    idea = create(:idea).tap do |i|
      create(:reaction, reactable: i, mode: 'up')
      create(:reaction, reactable: i, mode: 'down')
      create(:reaction, reactable: i, mode: 'neutral')
      create(:follower, followable: i)
      create(:comment, idea: i)
      create(:internal_comment, idea: i)
      create(:official_feedback, idea: i)

      basket = create(:basket, phase: i.phases.sole)
      create(:baskets_idea, idea: i, basket: basket, votes: 2)
      basket.update_counts!
    end.reload

    expect(idea.likes_count).to eq(1)
    expect(idea.dislikes_count).to eq(1)
    expect(idea.neutral_reactions_count).to eq(1)
    expect(idea.baskets_count).to eq(1)
    expect(idea.votes_count).to eq(2)
    expect(idea.followers_count).to eq(1)
    expect(idea.comments_count).to eq(1)
    expect(idea.internal_comments_count).to eq(1)
    expect(idea.official_feedbacks_count).to eq(1)

    service.copy([idea], dest_phase, nil)
    copy = dest_phase.ideas.sole

    expect(copy.likes_count).to eq(0)
    expect(copy.dislikes_count).to eq(0)
    expect(copy.neutral_reactions_count).to eq(0)
    expect(copy.baskets_count).to eq(0)
    expect(copy.votes_count).to eq(0)
    expect(copy.followers_count).to eq(0)
    expect(copy.comments_count).to eq(0)
    expect(copy.internal_comments_count).to eq(0)
    expect(copy.official_feedbacks_count).to eq(0)

    expect(copy.reactions).to be_empty
    expect(copy.baskets).to be_empty
    expect(copy.followers).to be_empty
    expect(copy.comments).to be_empty
    expect(copy.internal_comments).to be_empty
    expect(copy.official_feedbacks).to be_empty
  end

  it 'does not copy the assignee' do
    idea = create(:idea, :with_assignee)
    service.copy([idea], dest_phase, nil)
    expect(dest_phase.ideas.sole.assignee_id).to be_nil
  end

  it 'does not copy manual vote data' do
    idea = create(:idea).tap do |i|
      i.manual_votes_amount = 123
      i.manual_votes_last_updated_at = Time.current
      i.manual_votes_last_updated_by = create(:admin)
    end

    service.copy([idea], dest_phase, nil)

    copy = dest_phase.ideas.sole
    expect(copy.manual_votes_amount).to eq(0)
    expect(copy.manual_votes_last_updated_at).to be_nil
    expect(copy.manual_votes_last_updated_by_id).to be_nil
  end

  describe 'error handling' do
    it 'continues processing other ideas when one fails' do
      good_idea, bad_idea = create_pair(:idea)
      allow(bad_idea).to receive(:dup).and_raise(StandardError.new('Test error'))

      summary = service.copy([good_idea, bad_idea], dest_phase, nil)

      expect(dest_phase.ideas.count).to eq(1)
      expect(summary.count).to eq(2)
      expect(summary.errors).to match(
        bad_idea.id => be_a(StandardError).and(have_attributes(message: 'Test error'))
      )
    end
  end
end
