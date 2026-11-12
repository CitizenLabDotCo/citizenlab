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

  describe 'icon' do
    it 'accepts a single emoji' do
      expect(build(:default_input_topic, icon: '🚲')).to be_valid
    end

    it 'accepts no icon' do
      expect(build(:default_input_topic, icon: nil)).to be_valid
      expect(build(:default_input_topic, icon: '')).to be_valid
    end

    it 'rejects markup' do
      topic = build(:default_input_topic, icon: '<img src=x onerror=alert(1)>')
      expect(topic).not_to be_valid
      expect(topic.errors.details[:icon]).to include(error: :invalid)
    end

    it 'rejects more than one emoji' do
      expect(build(:default_input_topic, icon: '🚲🚗')).not_to be_valid
    end

    it 'still lets a stored legacy icon be saved when the icon itself is not changed' do
      topic = create(:default_input_topic)
      topic.update_column(:icon, 'medical')

      expect(topic.reload.update(title_multiloc: { 'en' => 'Renamed' })).to be true
    end
  end

  describe 'title sanitizer' do
    it 'does not carry a payload into the input topics copied from it' do
      create(:default_input_topic, title_multiloc: { 'en' => '<img src=x onerror=alert(1)>hi' })
      project = create(:project)
      project.set_default_input_topics!

      expect(project.input_topics.map { |topic| topic.title_multiloc['en'] }).to eq ['hi']
    end
  end
end
