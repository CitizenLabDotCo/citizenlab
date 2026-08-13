# frozen_string_literal: true

require 'rails_helper'

RSpec.describe DecidimImporter::IdeaStatuses do
  describe '.code_for_state_token' do
    it 'maps Decidim state tokens onto ideation status codes, defaulting to proposed' do
      expect(described_class.code_for_state_token('accepted')).to eq('accepted')
      expect(described_class.code_for_state_token('evaluating')).to eq('under_consideration')
      expect(described_class.code_for_state_token('not_answered')).to eq('proposed')
      expect(described_class.code_for_state_token('withdrawn')).to eq('rejected')
      expect(described_class.code_for_state_token('')).to eq('proposed')
      expect(described_class.code_for_state_token('something_else')).to eq('proposed')
    end
  end

  describe '.resolve!' do
    it 'swaps idea_status_code for the ideation status id, scoped to the ideation method' do
      ideation = create(:idea_status, code: 'accepted', participation_method: 'ideation')
      # A proposals-method status shares the code — the lookup must NOT pick this one.
      create(:idea_status, code: 'accepted', participation_method: 'proposals')

      template = { 'models' => { 'idea' => [{ 'title_multiloc' => { 'en' => 'X' }, 'idea_status_code' => 'accepted' }] } }
      described_class.resolve!(template)

      idea = template['models']['idea'].first
      expect(idea).not_to have_key('idea_status_code')
      expect(idea['idea_status_id']).to eq(ideation.id)
    end

    it 'is a no-op when there are no ideas' do
      template = { 'models' => { 'user' => [{ 'email' => 'a@b.co' }] } }
      expect { described_class.resolve!(template) }.not_to raise_error
    end

    it 'falls back to the always-seeded proposed status when the mapped status is absent' do
      proposed = create(:idea_status, code: 'proposed', participation_method: 'ideation')
      # No `accepted` ideation status exists in this tenant.

      template = { 'models' => { 'idea' => [{ 'idea_status_code' => 'accepted' }] } }
      described_class.resolve!(template)

      expect(template['models']['idea'].first['idea_status_id']).to eq(proposed.id)
    end

    it 'raises only when even the fallback proposed status is missing' do
      template = { 'models' => { 'idea' => [{ 'idea_status_code' => 'accepted' }] } }
      expect { described_class.resolve!(template) }.to raise_error(ActiveRecord::RecordNotFound)
    end
  end
end
