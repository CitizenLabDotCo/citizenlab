# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Callable::Test::SimpleService do
  subject(:result) { described_class.call }

  describe '::call' do
    it 'succeeds' do
      expect(result).to be_a_success
    end

    it 'returns a result object' do
      expect(result.log_result).to eq('it works')
    end
  end
end
