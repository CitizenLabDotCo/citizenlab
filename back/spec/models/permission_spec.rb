# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Permission, type: :model do
  describe 'Default factory' do
    it 'is valid' do
      expect(build(:permission)).to be_valid
    end
  end
end
