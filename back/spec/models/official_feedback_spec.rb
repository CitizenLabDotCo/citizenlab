# frozen_string_literal: true

require 'rails_helper'

RSpec.describe OfficialFeedback do
  subject { build(:official_feedback) }

  describe 'Default factory' do
    it { is_expected.to be_valid }
  end

  it { is_expected.to belong_to(:idea) }
  it { is_expected.to belong_to(:user).optional }
  it { is_expected.to have_many(:notifications).dependent(:nullify) }
  it { is_expected.to validate_presence_of(:idea) }
  it { is_expected.to validate_presence_of(:body_multiloc) }
  it { is_expected.to validate_presence_of(:author_multiloc) }

  describe 'body_multiloc' do
    it '#sanitize_body_multiloc sanitizes script tags in the body' do
      official_feedback = create(:official_feedback, body_multiloc: {
        'en' => '<p>Test</p><script>These tags should be removed!</script>'
      })
      expect(official_feedback.body_multiloc).to eq({ 'en' => '<p>Test</p>These tags should be removed!' })
    end

    it 'with invalid locales marks the model as invalid' do
      official_feedback = build(:official_feedback, body_multiloc: { 'se-BI' => 'awesome area' })
      expect(official_feedback).to be_invalid
    end
  end
end
