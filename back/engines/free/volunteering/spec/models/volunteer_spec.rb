# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Volunteering::Volunteer do
  describe 'Default factory' do
    it 'is valid' do
      expect(build(:volunteer)).to be_valid
    end
  end
end
