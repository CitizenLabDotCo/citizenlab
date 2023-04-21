# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Activity do
  context 'Default factory' do
    it 'is valid' do
      expect(build(:activity)).to be_valid
    end

    describe 'without item' do
      it 'is invalid' do
        expect(build(:activity, item: nil)).to be_invalid
      end
    end
  end
end
