# frozen_string_literal: true

require 'rails_helper'

describe JsonValidator do
  subject(:record) { Klass.new }

  context 'with trivial string schema' do
    before do
      klass = Class.new do
        include ActiveModel::Validations
        validates :json_field, json: { schema: { type: 'string' } }
        attr_accessor :json_field
      end

      stub_const('Klass', klass)
    end

    it 'is valid with a string' do
      record.json_field = 'hello'
      expect(record).to be_valid
    end

    it 'is invalid with nil value' do
      record.json_field = nil
      expect(record).to be_invalid
    end

    it 'sets correct AR errors on its instance when invalid' do
      record.json_field = nil
      record.validate
      expect(record.errors.details.to_h).to match(
        { json_field: [
          { error: {
              fragment: '#/',
              error: 'TypeV4',
              human_message: kind_of(String)
            },
            value: nil }
        ] }
      )
    end
  end

  context 'with object schema' do
    before do
      klass = Class.new do
        include ActiveModel::Validations
        validates :json_field, json: { schema: {
          type: 'object',
          properties: {
            age: { type: 'number' },
            name: { type: 'string' }
          }
        } }
        attr_accessor :json_field
      end

      stub_const('Klass', klass)
    end

    it 'sets correct AR errors on its instance when invalid' do
      record.json_field = {
        age: 'four',
        name: 456
      }
      record.validate
      expect(record.errors.details.to_h).to match({
        json_field: [
          { error: {
              fragment: '#/age',
              error: 'TypeV4',
              human_message: kind_of(String)
            },
            value: { age: 'four', name: 456 } },
          { error: {
              fragment: '#/name',
              error: 'TypeV4',
              human_message: kind_of(String)
            },
            value: { age: 'four', name: 456 } }
        ]
      })
    end
  end

  describe 'when passed a proc to schema' do
    before do
      klass = Class.new do
        include ActiveModel::Validations
        validates :json_field, json: { schema: lambda {
                                                 self.this_got_executed = true
                                                 {}
                                               } }
        attr_accessor :json_field, :this_got_executed
      end

      stub_const('Klass', klass)
    end

    it 'calls the proc with the record as context' do
      record.validate
      expect(record.this_got_executed).to be true
    end
  end
end
