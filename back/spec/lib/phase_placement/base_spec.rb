# frozen_string_literal: true

require 'rails_helper'

RSpec.describe PhasePlacement::Base do
  subject(:placement) { described_class.new }

  describe '#sequential?' do
    it 'raises NotImplementedError' do
      expect { placement.sequential? }.to raise_error(NotImplementedError)
    end
  end

  describe '#presented_as_page?' do
    it 'raises NotImplementedError' do
      expect { placement.presented_as_page? }.to raise_error(NotImplementedError)
    end
  end
end
