# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Analytics::Reporting::Input do
  it 'exposes a published idea with its localized title and counters' do
    idea = create(:idea, title_multiloc: { 'en' => 'Plant more trees', 'nl-BE' => 'Plant meer bomen' })
    row = described_class.find(idea.id)

    expect(row.title).to eq 'Plant more trees'
    expect(row.user_id).to eq idea.author_id
    expect(row.project_id).to eq idea.project_id
    expect(row.participation_method).to eq 'ideation'
    expect(row.likes_count).to eq idea.likes_count
    expect(row.comments_count).to eq idea.comments_count
  end

  it 'includes submitted (pre-screening) inputs but excludes drafts' do
    submitted = create(:idea, publication_status: 'submitted', submitted_at: Time.zone.now)
    create(:idea, publication_status: 'draft')

    expect(described_class.ids).to eq [submitted.id]
  end

  it 'resolves the participation method of phase-specific inputs from their creation phase' do
    create(:idea_status_proposed)
    response = create(:native_survey_response)

    expect(described_class.find(response.id).participation_method).to eq 'native_survey'
  end

  describe 'status' do
    it 'exposes the current status with label and code' do
      status = create(:idea_status, code: 'accepted', title_multiloc: { 'en' => 'Approved', 'nl-BE' => 'Goedgekeurd' })
      idea = create(:idea, idea_status: status)
      row = described_class.find(idea.id)

      expect(row.status_id).to eq status.id
      expect(row.status_label).to eq 'Approved'
      expect(row.status_code).to eq 'accepted'
    end

    it 'is NULL for inputs without a status' do
      idea = create(:idea)
      idea.update_column(:idea_status_id, nil)

      expect(described_class.find(idea.id).status_id).to be_nil
    end
  end

  describe 'imported' do
    it 'flags inputs that were imported by administrators' do
      idea = create(:idea)
      imported_idea = create(:idea)
      create(:idea_import, idea: imported_idea)

      expect(described_class.find(idea.id).imported).to be false
      expect(described_class.find(imported_idea.id).imported).to be true
    end
  end

  describe 'received_feedback' do
    it 'is false without any administrator feedback' do
      idea = create(:idea)

      expect(described_class.find(idea.id).received_feedback).to be false
    end

    it 'is true after official feedback' do
      feedback = create(:official_feedback)

      expect(described_class.find(feedback.idea_id).received_feedback).to be true
    end

    it 'is true after a status change' do
      idea = create(:idea)
      create(:idea_changed_status_activity, item: idea)

      expect(described_class.find(idea.id).received_feedback).to be true
    end
  end

  describe 'offline_votes_count' do
    it 'exposes manual votes and defaults to 0' do
      idea = create(:idea)
      offline_idea = create(:idea, manual_votes_amount: 5)

      expect(described_class.find(idea.id).offline_votes_count).to eq 0
      expect(described_class.find(offline_idea.id).offline_votes_count).to eq 5
    end
  end
end
