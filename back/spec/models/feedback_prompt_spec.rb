# frozen_string_literal: true

require 'rails_helper'

RSpec.describe FeedbackPrompt do
  describe 'PROMPTS' do
    described_class::PROMPTS.each do |key, definition|
      it "defines a valid prompt for #{key}" do
        expect(definition.keys).to contain_exactly(:audience, :subject_type, :expires_after)
        expect(described_class::AUDIENCES).to have_key(definition[:audience])
        expect(definition[:expires_after]).to be_a(ActiveSupport::Duration)
        expect(definition[:subject_type]&.safe_constantize).to be_present if definition[:subject_type]
      end
    end
  end

  describe '.askable?' do
    it 'asks admins and project managers for a prompt meant for managers' do
      expect(described_class.askable?('return_findability', create(:admin))).to be true
      expect(described_class.askable?('return_findability', create(:project_moderator))).to be true
    end

    it 'does not ask residents' do
      expect(described_class.askable?('return_findability', create(:user))).to be false
    end

    it 'only asks admins for a prompt meant for admins' do
      stub_const('FeedbackPrompt::PROMPTS', { 'admin_only' => { audience: 'admins', subject_type: nil, expires_after: 1.day } })
      expect(described_class.askable?('admin_only', create(:admin))).to be true
      expect(described_class.askable?('admin_only', create(:project_moderator))).to be false
    end

    it 'does not ask anyone for an unknown prompt' do
      expect(described_class.askable?('unknown', create(:admin))).to be false
    end
  end

  describe 'validations' do
    it 'requires the subject the prompt is about' do
      prompt = build(:feedback_prompt, key: 'project_setup_ease', subject: create(:idea))
      expect(prompt).not_to be_valid
      expect(prompt.errors.details[:subject]).to include(error: :invalid)
    end

    it 'rejects a subject for a prompt about nothing in particular' do
      expect(build(:feedback_prompt, key: 'return_findability', subject: create(:project))).not_to be_valid
    end

    it 'requires a score once answered' do
      expect(build(:feedback_prompt, status: 'answered')).not_to be_valid
    end
  end
end
