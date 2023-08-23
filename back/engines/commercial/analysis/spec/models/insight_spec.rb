# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Analysis::Insight do
  subject { insight }

  let(:insight) { build(:insight) }

  describe 'Default factory' do
    it { is_expected.to be_valid }
  end

  describe 'FILTERS_JSON_SCHEMA' do
    it 'is a valid JSON schema' do
      metaschema = JSON::Validator.validator_for_name('draft6').metaschema
      expect(JSON::Validator.validate!(metaschema, Analysis::Insight::FILTERS_JSON_SCHEMA)).to be true
    end
  end

  describe 'filters' do
    it 'is valid when all static properties are set' do
      insight.filters = {
        'search' => 'dog',
        'reactions_from' => 3,
        'reactions_to' => 6,
        'votes_from' => 1,
        'votes_to' => 2,
        'comments_from' => 0,
        'comments_to' => 100,
        'tag_ids' => [SecureRandom.uuid],
        'published_at_from' => '2023-04-06',
        'published_at_to' => '2023-06-30'
      }
      expect(insight).to be_valid
    end

    it 'is valid with array nil values' do
      insight.filters = {
        "author_custom_#{SecureRandom.uuid}" => [nil],
        'tag_ids' => [nil]
      }
      expect(insight).to be_valid
    end

    it 'is valid when custom_author properties are set' do
      insight.filters = {
        "author_custom_#{SecureRandom.uuid}" => [4],
        "author_custom_#{SecureRandom.uuid}_from" => 5,
        "author_custom_#{SecureRandom.uuid}_to" => 1
      }
      expect(insight).to be_valid
    end

    it 'is invalid when extra properties are set' do
      insight.filters = {
        'this is not a filter' => 5
      }
      expect(insight).to be_invalid
    end
  end
end
