# frozen_string_literal: true

require 'rails_helper'

RSpec.describe SpamReport do
  describe 'Default factory' do
    it 'is valid' do
      expect(build(:spam_report)).to be_valid
    end
  end
end
