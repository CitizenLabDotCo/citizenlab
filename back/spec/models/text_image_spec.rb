# frozen_string_literal: true

require 'rails_helper'

RSpec.describe TextImage do
  describe 'Default factory' do
    it 'is valid' do
      expect(build(:text_image)).to be_valid
    end
  end
end
