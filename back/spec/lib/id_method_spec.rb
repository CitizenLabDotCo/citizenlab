# frozen_string_literal: true

require 'rails_helper'

describe IdMethod do
  describe '.add_method' do
    it 'adds methods that are exposed through #all_methods' do
      mthd = Struct.new(:id).new('9fb591e7-f577-40a7-8596-03e406d7eebe')
      described_class.add_method('a_method', mthd)
      expect(described_class.all_methods).to include({ 'a_method' => mthd })
    end

    it 'replaces duplicate methods with the same name' do
      mthd1 = Struct.new(:id).new('9fb591e7-f577-40a7-8596-03e406d7eebe')
      mthd2 = Struct.new(:id).new('9fb591e7-f577-40a7-8596-03e406d7eebe')
      described_class.add_method('a_method', mthd1)
      described_class.add_method('a_method', mthd2)

      expect(described_class.all_methods['a_method']).not_to eq mthd1
      expect(described_class.all_methods['a_method']).to eq mthd2
    end
  end
end
