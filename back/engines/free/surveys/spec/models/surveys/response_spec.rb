# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Surveys::Response do
  describe 'Default factory' do
    it 'is valid' do
      expect(build(:survey_response)).to be_valid
    end
  end

  describe 'answers JSON schema' do
    it 'is a valid JSON schema' do
      metaschema = JSON::Validator.validator_for_name('draft4').metaschema
      expect(JSON::Validator.validate!(metaschema, Surveys::Response::ANSWERS_JSON_SCHEMA)).to be true
    end
  end
end
