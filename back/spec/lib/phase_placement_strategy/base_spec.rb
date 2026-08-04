# frozen_string_literal: true

require 'rails_helper'

RSpec.describe PhasePlacementStrategy::Base do
  subject(:placement_strategy) { described_class.new }

  describe '#sequential?' do
    it 'raises NotImplementedError' do
      expect { placement_strategy.sequential? }.to raise_error(NotImplementedError)
    end
  end

  describe '#presented_as_page?' do
    it 'raises NotImplementedError' do
      expect { placement_strategy.presented_as_page? }.to raise_error(NotImplementedError)
    end
  end
end
