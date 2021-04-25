# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Callable::Test::ComplexService do
  subject(:result) { described_class.test }

  describe '::test' do
    it 'returns a result object' do
      expect(result.log_result).to eq('it works')
    end
  end
end
