# frozen_string_literal: true

require 'rails_helper'

RSpec.describe AppConfiguration, type: :model do
  describe '.style_json_schema' do
    let(:style_json_schema) { described_class.style_json_schema }

    it 'returns a valid json-schema' do
      meta_schema = JSON::Validator.validator_for_name('draft4').metaschema
      expect(JSON::Validator.validate(meta_schema, style_json_schema)).to be(true)
    end
  end

  describe 'validation' do
    context 'when style is not valid' do
      subject { build(:app_configuration, style: { invalid_style_property: 'irrelevant-value' }) }

      it { is_expected.to be_invalid }
    end
  end
end
