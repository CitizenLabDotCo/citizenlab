# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Activity do
  context 'Default factory' do
    it 'is valid' do
      expect(build(:experiment)).to be_valid
    end
  end
end
