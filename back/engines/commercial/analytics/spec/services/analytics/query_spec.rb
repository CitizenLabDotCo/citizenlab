# frozen_string_literal: true

require 'rails_helper'

describe Analytics::Query do
  subject(:service) { described_class.new }

  describe '#initialize' do
    it 'accepts ActionController::Parameters' do
      params = ActionController::Parameters.new({})
      query = described_class.new(params).json_query
      expect(query.class).to eq(ActiveSupport::HashWithIndifferentAccess)
    end

    it 'accepts Hash' do
      params = {}
      query = described_class.new(params).json_query
      expect(query.class).to eq(ActiveSupport::HashWithIndifferentAccess)
    end

    it 'accepts HashWithIndifferentAccess' do
      params = {}.with_indifferent_access
      query = described_class.new(params).json_query
      expect(query.class).to eq(ActiveSupport::HashWithIndifferentAccess)
    end

    it 'raises ArgumentError for other types' do
      expect { described_class.new('string') }.to raise_error(ArgumentError)
    end
  end
end
