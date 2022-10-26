# frozen_string_literal: true

# rubocop:disable Lint/BinaryOperatorWithIdenticalOperands

require 'rails_helper'

describe IdFranceconnect::FranceconnectOmniauth do
  describe '#can_be_merged?' do
    using RSpec::Parameterized::TableSyntax

    subject(:omniauth) { described_class.new }

    where(:user_first_name, :attrs_first_name, :user_last_name, :attrs_last_name, :should_be_merged) do
      # artificial examples
      '1' | '2' | nil | nil | false
      '1' | '1' | nil | nil | true
      nil | nil | nil | nil | false
      ''  | ''  | nil | nil | false

      # one-word names
      'Pierre' | 'Pierré' | nil | nil | true
      nil | nil | 'Pierre' | 'Pierré' | true
      nil | nil | 'Pierre' | 'Pier'   | false
      'Pierre' | 'Pierr'  | nil | nil | true
      'Piere'  | 'Pierre' | nil | nil | true
      'Pierme' | 'Pierre' | nil | nil | true
      'Pierre' | 'Pier'   | nil | nil | false
      'Pie'    | 'Piu'    | nil | nil | false
      'Pie'    | 'Pie'    | nil | nil | true
      'Pierre' | 'Pier'   | 'Pierre' | 'Pier' | false

      # multiple-word names
      'Jean Philippe Arnaud' | 'Jean Philippe Arnaud' | nil | nil | true
      'Jean Philippe Arnaud' | 'Philippe' | nil | nil | true
      'Jean Philippe Arnaud' | 'Philipe'  | nil | nil | true
      'Jean Philippe Arnaud' | 'Philip'   | nil | nil | false
    end

    with_them do
      it 'can be merged as expected' do
        user = User.new(first_name: user_first_name, last_name: user_last_name)
        user_attrs = { first_name: attrs_first_name, last_name: attrs_last_name }

        expect(omniauth.can_be_merged?(user, user_attrs)).to eq(should_be_merged)
      end
    end
  end
end

# rubocop:enable Lint/BinaryOperatorWithIdenticalOperands
