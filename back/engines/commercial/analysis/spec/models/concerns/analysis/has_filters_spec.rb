# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Analysis::HasFilters do
  let(:schema) { Analysis::HasFilters::FILTERS_JSON_SCHEMA }

  describe 'filters schema patternProperties' do
    let(:pattern_properties) { schema['patternProperties'] }

    describe 'custom field range pattern' do
      let(:pattern) { Regexp.new(pattern_properties.keys.find { |k| k.include?('from|to') }) }

      it 'matches valid custom field range filters' do
        expect(pattern).to match('author_custom_a1b2c3d4-e5f6-7890-abcd-ef1234567890_from')
        expect(pattern).to match('input_custom_abcdef01-2345-6789-abcd-ef0123456789_to')
      end

      it 'rejects invalid prefixes' do
        expect(pattern).not_to match('other_custom_abcdef-1234_from')
      end
    end

    describe 'custom field filter pattern' do
      let(:pattern) { Regexp.new(pattern_properties.keys.find { |k| !k.include?('from|to') }) }

      it 'matches valid custom field filters' do
        expect(pattern).to match('author_custom_a1b2c3d4-e5f6-7890-abcd-ef1234567890')
        expect(pattern).to match('input_custom_abcdef01-2345-6789-abcd-ef0123456789')
      end

      it 'rejects invalid prefixes' do
        expect(pattern).not_to match('other_custom_abcdef-1234')
      end
    end
  end
end
