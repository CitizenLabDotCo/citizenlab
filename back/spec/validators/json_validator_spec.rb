# frozen_string_literal: true

require 'rails_helper'
class StringValidatable
  include ActiveModel::Validations
  validates :json_field, json: { schema: { type: 'string' }, options: { errors_as_objects: true } }
  attr_accessor :json_field
end

class ObjectValidatable
  include ActiveModel::Validations
  validates :json_field, json: { schema: {
    '$id': 'test-schema',
    type: 'object',
    properties: {
      age: { type: 'number' },
      name: { type: 'string' }
    }
  }, message: lambda { |errors|
    errors.map do |e|
      { fragment: e[:fragment], error: e[:failed_attribute], human_message: e[:message] }
    end
  }, options: { errors_as_objects: true } }
  attr_accessor :json_field
end

describe JsonValidator do
  context 'with trivial string schema' do
    let(:model) { StringValidatable.new }

    it 'is valid with a string' do
      model.json_field = 'hello'
      expect(model).to be_valid
    end

    it 'is invalid with nil value' do
      model.json_field = nil
      expect(model).to be_invalid
    end

    it 'sets correct AR errors on its instance when invalid' do
      model.json_field = nil
      model.validate
      expect(model.errors.details).to eq({ json_field: [{ error: :invalid_json, value: nil }] })
    end
  end

  context 'with object schema' do
    let(:model) { ObjectValidatable.new }

    it 'sets correct AR errors on its instance when invalid' do
      model.json_field = {
        age: 'four',
        name: 456
      }
      model.validate
      expect(model.errors.details.to_h).to match({
        json_field: [
          { error: { fragment: '#/age',
                     error: 'TypeV4',
                     human_message: kind_of(String) },
            value: { age: 'four', name: 456 } },
          { error: { fragment: '#/name',
                     error: 'TypeV4',
                     human_message: kind_of(String) },
            value: { age: 'four', name: 456 } }
        ]
      })
    end
  end
end
