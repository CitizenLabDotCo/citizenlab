# frozen_string_literal: true

require 'rails_helper'

RSpec.describe BasketsIdea do
  context 'Default factory' do
    it 'is valid' do
      expect(build(:baskets_idea)).to be_valid
    end
  end
end
