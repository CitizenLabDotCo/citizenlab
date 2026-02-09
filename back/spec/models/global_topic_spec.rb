# frozen_string_literal: true

require 'rails_helper'

RSpec.describe GlobalTopic do
  describe 'Default factory' do
    it 'is valid' do
      expect(build(:global_topic)).to be_valid
    end
  end

  it { is_expected.to validate_presence_of(:title_multiloc) }
end
