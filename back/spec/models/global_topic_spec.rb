# frozen_string_literal: true

require 'rails_helper'

RSpec.describe GlobalTopic do
  describe 'Default factory' do
    it 'is valid' do
      expect(build(:global_topic)).to be_valid
    end
  end

  it { is_expected.to validate_presence_of(:title_multiloc) }

  it_behaves_like 'a plain text multiloc', factory: :global_topic

  describe 'title sanitizer' do
    # The guard used to test description_multiloc, so a topic with no description kept its
    # untrimmed title.
    it 'trims whitespace even when the description is empty' do
      topic = create(:global_topic, title_multiloc: { 'en' => '  spacious  ' }, description_multiloc: {})
      expect(topic.title_multiloc['en']).to eq 'spacious'
    end
  end
end
