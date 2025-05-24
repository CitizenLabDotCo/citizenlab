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

    it 'sanitizes when escaped HTML tags present' do
      official_feedback = create(:official_feedback, body_multiloc: {
        'en' => 'Something &lt;img src=x onerror=alert(1)&gt;'
      })
      expect(official_feedback.body_multiloc).to eq({ 'en' => 'Something ' })
    end

    it 'with invalid locales marks the model as invalid' do
      official_feedback = build(:official_feedback, body_multiloc: { 'se-BI' => 'awesome area' })
      expect(official_feedback).to be_invalid
    end
  end

  describe '#sanitize_author_multiloc' do
    it 'removes all HTML tags from author_multiloc' do
      official_feedback = build(
        :official_feedback,
        author_multiloc: {
          'en' => 'Something <script>alert("XSS")</script> something',
          'fr-BE' => 'Something <img src=x onerror=alert(1)>',
          'nl-BE' => 'Plain <b>text</b> with <i>formatting</i>'
        }
      )

      official_feedback.save!

      expect(official_feedback.author_multiloc['en']).to eq('Something alert("XSS") something')
      expect(official_feedback.author_multiloc['fr-BE']).to eq('Something ')
      expect(official_feedback.author_multiloc['nl-BE']).to eq('Plain text with formatting')
    end

    it 'sanitizes when escaped HTML tags present' do
      official_feedback = build(
        :official_feedback,
        author_multiloc: {
          'en' => 'Something &lt;script&gt;alert("XSS")&lt;/script&gt; something',
          'fr-BE' => 'Something &lt;img src=x onerror=alert(1)&gt;',
          'nl-BE' => 'Plain &lt;b&gt;text&lt;/b&gt; with &lt;i&gt;formatting&lt;/i&gt;'
        }
      )

      official_feedback.save!

      expect(official_feedback.author_multiloc['en']).to eq('Something alert("XSS") something')
      expect(official_feedback.author_multiloc['fr-BE']).to eq('Something ')
      expect(official_feedback.author_multiloc['nl-BE']).to eq('Plain text with formatting')
    end
  end
end
