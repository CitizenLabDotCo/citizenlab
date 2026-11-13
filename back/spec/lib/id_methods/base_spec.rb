# frozen_string_literal: true

require 'rails_helper'

describe IdMethods::Base do
  let(:method_class) do
    Class.new(described_class) do
      def config_parameters_schema
        {
          public_param: { type: 'string' },
          private_param: { type: 'string', private: true }
        }
      end
    end
  end

  describe '#config_parameters' do
    it 'returns the schema keys, in order' do
      expect(method_class.new.config_parameters).to eq %i[public_param private_param]
    end

    it 'is empty when the method has no schema' do
      expect(Class.new(described_class).new.config_parameters).to eq []
    end
  end

  describe '#public_config_parameters' do
    it 'returns the parameters whose schema is not marked private' do
      expect(method_class.new.public_config_parameters).to eq [:public_param]
    end
  end
end
