# frozen_string_literal: true

require 'rails_helper'

RSpec.describe InputTypeStrategy::Base do
  describe '#logic_operators' do
    choice = %w[one_of none_of present absent]
    multiple_choice = %w[contains_any contains_all present absent]
    scale = %w[eq one_of none_of gt gte lt lte present absent]
    expected = {
      'select' => choice,
      'multiselect' => multiple_choice,
      'multiselect_image' => multiple_choice,
      'linear_scale' => scale,
      'rating' => scale,
      'ranking' => %w[present absent]
    }

    Dir[Rails.root.join('lib/input_type_strategy/*.rb')].map { |file| File.basename(file, '.rb') }.excluding('base').each do |input_type|
      it "is #{expected.fetch(input_type, []).inspect} for #{input_type}" do
        strategy = "InputTypeStrategy::#{input_type.camelize}".constantize.new(nil)

        expect(strategy.logic_operators).to eq(expected.fetch(input_type, []))
      end
    end

    it 'only uses operators the walker knows' do
      expect(expected.values.flatten.uniq - FormLogic::Conditions::OPERATORS).to be_empty
    end
  end
end
