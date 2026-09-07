# frozen_string_literal: true

require 'rails_helper'

RSpec.describe DefaultInputTopic do
  describe 'Default factory' do
    it 'is valid' do
      expect(build(:default_input_topic)).to be_valid
    end
  end

  it_behaves_like 'a plain text multiloc', factory: :default_input_topic
  it_behaves_like 'a decoration-only description', factory: :default_input_topic

  describe 'title sanitizer' do
    it 'does not carry a payload into the input topics copied from it' do
      create(:default_input_topic, title_multiloc: { 'en' => '<img src=x onerror=alert(1)>hi' })
      project = create(:project)
      project.set_default_input_topics!

      expect(project.input_topics.map { |topic| topic.title_multiloc['en'] }).to eq ['hi']
    end
  end
end
