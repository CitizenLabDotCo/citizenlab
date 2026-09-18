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

  # An omniauth method writes an existing user's profile only through
  # UserService.update_in_sso!, which is limited to updateable_user_attrs. A locked
  # attribute that is not also updateable stays blank and cannot be filled in by the
  # user either.
  #
  # IdMethods::Base#updateable_user_attrs already folds in locked_attributes, so this
  # guards against an override that adds attributes without calling `super`.
  describe 'omniauth methods' do
    it 'can update every attribute they lock' do
      omniauth_methods = described_class.all_methods.select do |method|
        method.respond_to?(:verification_method_type) && method.verification_method_type == :omniauth &&
          method.respond_to?(:locked_attributes)
      end
      expect(omniauth_methods).not_to be_empty

      aggregate_failures do
        omniauth_methods.each do |method|
          expect(method.locked_attributes - method.updateable_user_attrs)
            .to be_empty, "#{method.name} locks #{method.locked_attributes - method.updateable_user_attrs} without updating them"
        end
      end
    end
  end
end
