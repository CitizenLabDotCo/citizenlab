# frozen_string_literal: true

require 'rails_helper'
require 'query'

describe Analytics::QueryValidatorService do
  describe 'validate query object with json schema' do
    it 'fails on empty query' do
      query_param = ActionController::Parameters.new({})
      query = Analytics::Query.new(query_param)

      validator = described_class.new(query)
      all_messages = validator.messages.join(' ')
      required_keys = [
        'did not contain a required property of \'aggregations\'',
        'did not contain a required property of \'fact\'',
        'did not contain a required property of \'fields\''
      ]
      expect(required_keys.all? { |msg| all_messages.include? msg }).to be true
      expect(validator.valid).to be false
    end

    it 'fails on inexistent query attribute' do
      query_param = ActionController::Parameters.new(
        fact: 'post',
        fields: 'id',
        other: 'value'
      )
      query = Analytics::Query.new(query_param)

      validator = described_class.new(query)

      expect(validator.messages[0]).to include 'contains additional properties ["other"] outside of the schema when none are allowed'
      expect(validator.valid).to be false
    end

    it 'fails on inexistent column reference' do
      query_param = ActionController::Parameters.new(fact: 'post', fields: 'some_field')
      query = Analytics::Query.new(query_param)

      validator = described_class.new(query)
      expect(validator.valid).to be false
      expect(validator.messages).to include 'Fields field some_field does not exist.'
    end

    it 'fails on invalid characters' do
      query_param = ActionController::Parameters.new(
        fact: 'post',
        fields: 'id',
        'A' => '',
        '%' => '',
        '//' => '',
        ' ' => ''
      )
      query = Analytics::Query.new(query_param)

      validator = described_class.new(query)
      expect(validator.valid).to be false
      expect(validator.messages[0]).to include 'contains additional properties ["A", "%", "//", " "] outside of the schema when none are allowed'
    end

    it 'fails on invalid date' do
      query_param = ActionController::Parameters.new(
        fact: 'post',
        fields: 'id',
        filters: {
          'created_date.date': { from: 'xxxx', to: '2022-01-01' }
        }
      )
      query = Analytics::Query.new(query_param)

      validator = described_class.new(query)
      expect(validator.valid).to be false
      expect(validator.messages).to include 'Invalid \'from\' date for created_date.date.'
    end

    it 'pass on valid query' do
      query_param = ActionController::Parameters.new(
        fact: 'post',
        fields: 'id',
        filters: {
          'dimension_date_created.date': { from: '2021-01-01', to: '2022-01-01' }
        }
      )
      query = Analytics::Query.new(query_param)

      validator = described_class.new(query)
      expect(validator.valid).to be true
    end
  end
end
