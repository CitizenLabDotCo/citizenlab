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
  # UserService.update_in_sso!, which slices the auth response down to
  # updateable_user_attrs. Whatever a method locks but does not update stays blank
  # forever: the SSO never writes it, and the user cannot fill it in either.
  describe 'omniauth methods' do
    let(:omniauth_methods) do
      described_class.all_methods.select do |method|
        method.respond_to?(:verification_method_type) && method.verification_method_type == :omniauth
      end
    end

    # IdMethods::Base#updateable_user_attrs already folds in locked_attributes, so this
    # guards against an override that adds attributes without calling `super`.
    it 'can update every attribute they lock' do
      methods = omniauth_methods.select { |method| method.respond_to?(:locked_attributes) }
      expect(methods).not_to be_empty

      aggregate_failures do
        methods.each do |method|
          expect(method.locked_attributes - method.updateable_user_attrs)
            .to be_empty, "#{method.name} locks #{method.locked_attributes - method.updateable_user_attrs} without updating them"
        end
      end
    end

    context 'when every method is configured' do
      # Some methods read the keys of the custom fields they lock from their config, so
      # they lock nothing at all until they are configured.
      before do
        configuration = AppConfiguration.instance
        configuration.settings['id_config'] = {
          'allowed' => true,
          'enabled' => true,
          'id_methods' => omniauth_methods.map { |method| id_config_entry(method) }
        }
        configuration.save!
      end

      it 'can update every custom field they lock' do
        methods = omniauth_methods.select { |method| method.respond_to?(:locked_custom_fields) }
        expect(methods).not_to be_empty

        aggregate_failures do
          methods.each do |method|
            next if method.locked_custom_fields.empty?

            expect(method.updateable_user_attrs)
              .to include(:custom_field_values), "#{method.name} locks #{method.locked_custom_fields} without updating them"
          end
        end
      end
    end
  end

  # Fills in the *_custom_field_key config parameters, so that the methods reading the
  # keys they lock from their config do lock something.
  def id_config_entry(method)
    entry = { 'name' => method.name }
    method.try(:config_parameters).to_a.grep(/custom_field_key\z/).each do |parameter|
      entry[parameter.to_s] = parameter.to_s.delete_suffix('_custom_field_key')
    end
    entry
  end
end
