# frozen_string_literal: true

require 'rails_helper'
require 'query'

describe Analytics::QueryValidatorService do
  describe 'validate query object with json schema' do
    it 'fails on new top level attributes' do
      query_param = ActionController::Parameters.new(query: { other: 'value' })
      query = Analytics::Query.new(query_param)

      validator = described_class.new(query)
      expect(validator.valid).to be false
    end
  end
end
