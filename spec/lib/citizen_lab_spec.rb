# frozen_string_literal: true

require 'rails_helper'

RSpec.describe CitizenLab do
  describe '.root' do
    it 'returns the root path of the app' do
      expect(described_class.root).to eq(Pathname.new(File.expand_path('../..', __dir__)))
    end
  end
end
