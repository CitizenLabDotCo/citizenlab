# frozen_string_literal: true

require 'rails_helper'

describe IdMethods do
  describe '.add_method' do
    around do |example|
      methods = described_class.all_methods.dup
      example.run
      described_class.all_methods = methods
    end

    it 'adds methods that are exposed through #all_methods' do
      mthd = Struct.new(:id, :name).new('9fb591e7-f577-40a7-8596-03e406d7eebe', 'Test Method')
      described_class.add_method(mthd)
      expect(described_class.all_methods).to include(mthd)
    end

    it 'replaces duplicate methods with the same .id' do
      mthd1 = Struct.new(:id, :name).new('9fb591e7-f577-40a7-8596-03e406d7eebe', 'Test Method 1')
      mthd2 = Struct.new(:id, :name).new('9fb591e7-f577-40a7-8596-03e406d7eebe', 'Test Method 2')
      described_class.add_method(mthd1)
      described_class.add_method(mthd2)
      expect(described_class.all_methods.select { |m| m.id == '9fb591e7-f577-40a7-8596-03e406d7eebe' }).to contain_exactly(mthd2)
    end
  end
end
