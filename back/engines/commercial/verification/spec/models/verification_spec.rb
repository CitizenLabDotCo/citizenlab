# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Verification::Verification do
  describe 'Default factory' do
    it 'is valid' do
      expect(build(:verification)).to be_valid
    end
  end
end
