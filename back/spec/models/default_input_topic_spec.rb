# frozen_string_literal: true

require 'rails_helper'

RSpec.describe DefaultInputTopic do
  describe 'Default factory' do
    it 'is valid' do
      expect(build(:default_input_topic)).to be_valid
    end
  end

  describe 'title sanitizer' do
    it 'strips HTML tags from the title' do
      topic = create(:default_input_topic, title_multiloc: { 'en' => '<b>bold</b> topic' })
      expect(topic.title_multiloc['en']).to eq 'bold topic'
    end

    it 'strips script/event-handler payloads from the title' do
      topic = create(:default_input_topic, title_multiloc: { 'en' => '<img src=x onerror=alert(1)>hi' })
      expect(topic.title_multiloc['en']).not_to include('onerror')
      expect(topic.title_multiloc['en']).not_to include('<img')
    end

    # Default topics are copied into a project's input topics on creation, so a payload stored
    # here would be reintroduced with every new project.
    it 'does not carry a payload into the input topics copied from it' do
      create(:default_input_topic, title_multiloc: { 'en' => '<img src=x onerror=alert(1)>hi' })
      project = create(:project)
      project.set_default_input_topics!

      titles = project.input_topics.map { |topic| topic.title_multiloc['en'] }
      expect(titles).to be_present
      expect(titles.join).not_to include('onerror')
    end
  end
end
