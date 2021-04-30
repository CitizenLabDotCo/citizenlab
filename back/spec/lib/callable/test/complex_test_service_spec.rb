# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Callable::Test::ComplexService do
  subject(:result) { described_class.test }

  describe '::test' do
    it 'succeeds' do
      expect(result).to be_a_success
    end

    it 'returns a result object' do
      expect(result.log_result).to eq('it works')
    end
  end

  describe 'ChildService' do
    subject(:result) { described_class::ChildService.test }

    it 'succeeds' do
      expect(result).to be_a_success
    end

    it 'returns a result inherited from the parent' do
      expect(result.log_result).to eq('it works')
    end
  end

  describe 'FailureService' do
    subject(:result) { described_class::FailedService.test }

    it 'fails' do
      expect(result).to be_a_failure
    end

    it 'returns an error object' do
      expect(result.error).to be_a(described_class::ComplexError)
    end
  end
end
