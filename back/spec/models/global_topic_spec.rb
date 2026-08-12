# frozen_string_literal: true

require 'rails_helper'

RSpec.describe GlobalTopic do
  describe 'Default factory' do
    it 'is valid' do
      expect(build(:global_topic)).to be_valid
    end
  end

  it { is_expected.to validate_presence_of(:title_multiloc) }

  describe 'title sanitizer' do
    it 'strips HTML tags from the title' do
      topic = create(:global_topic, title_multiloc: { 'en' => '<b>bold</b> topic' })
      expect(topic.title_multiloc['en']).to eq 'bold topic'
    end

    it 'strips script/event-handler payloads from the title' do
      topic = create(:global_topic, title_multiloc: { 'en' => '<img src=x onerror=alert(1)>hi' })
      expect(topic.title_multiloc['en']).not_to include('onerror')
      expect(topic.title_multiloc['en']).not_to include('<img')
    end

    it 'leaves ampersands as plain text' do
      topic = create(:global_topic, title_multiloc: { 'en' => 'Fish & chips' })
      expect(topic.title_multiloc['en']).to eq 'Fish & chips'
    end

    # The guard used to test description_multiloc, so a topic with no description kept its
    # untrimmed title.
    it 'trims whitespace even when the description is empty' do
      topic = create(:global_topic, title_multiloc: { 'en' => '  spacious  ' }, description_multiloc: {})
      expect(topic.title_multiloc['en']).to eq 'spacious'
    end
  end
end
