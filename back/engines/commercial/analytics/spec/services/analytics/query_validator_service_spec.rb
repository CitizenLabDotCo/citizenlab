# frozen_string_literal: true

require 'rails_helper'
require 'query'

describe Analytics::QueryValidatorService do
  describe 'validate query object with json schema' do
    it 'fails on empty query' do
      query_param = ActionController::Parameters.new({})
      query = Analytics::Query.new(query_param)

      validator = described_class.new(query)
      expect(validator.valid).to be false
      expect(validator.messages).to include 'The property \'#/\' did not contain a required property of \'fact\' in schema file:///cl2_back/engines/commercial/analytics/app/services/analytics/query_schema.json'
    end

    it 'fails on inexistent query attribute' do
      query_param = ActionController::Parameters.new(fact: 'post', other: 'value')
      query = Analytics::Query.new(query_param)

      validator = described_class.new(query)
      expect(validator.valid).to be false
      expect(validator.messages).to include 'The property \'#/\' contains additional properties ["other"] outside of the schema when none are allowed in schema file:///cl2_back/engines/commercial/analytics/app/services/analytics/query_schema.json'
    end

    it 'fails on inexistent column reference' do
      query_param = ActionController::Parameters.new(fact: 'post', fields: 'some_field')
      query = Analytics::Query.new(query_param)

      validator = described_class.new(query)
      expect(validator.valid).to be false
      expect(validator.messages).to include 'Fields column some_field does not exist in fact table.'
    end

    it 'fails on invalid dates' do
      query_param = ActionController::Parameters.new(
        fact: 'post',
        fields: 'id',
        dimensions: {
          created_date: {
            date: { from: 'xxxx', to: '2022-01-01' }
          }
        }
      )
      query = Analytics::Query.new(query_param)

      validator = described_class.new(query)
      expect(validator.valid).to be false
      expect(validator.messages).to include 'Invalid \'from\' date in created_date dimension.'
    end
  end
end
