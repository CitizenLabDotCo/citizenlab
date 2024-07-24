# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Factory do
  describe '.instance' do
    it 'always returns the same object' do
      singleton = described_class.instance
      expect(described_class.instance).to equal singleton
    end
  end

  describe '.new' do
    it 'is a private method' do
      expect { described_class.new }.to raise_error NoMethodError
    end
  end
end
