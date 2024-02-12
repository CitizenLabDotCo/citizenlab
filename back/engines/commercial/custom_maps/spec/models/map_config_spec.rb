# frozen_string_literal: true

require 'rails_helper'

RSpec.describe CustomMaps::MapConfig do
  describe 'Default factory' do
    it 'is valid' do
      map_config = build(:map_config)
      map_config.mappable.save  # otherwise map_config.mappable_id is nil => map_config is invalid
      expect(map_config).to be_valid
    end
  end

  describe 'when mappable is a project' do
    it 'is valid' do
      map_config = build(:map_config, mappable: create(:project))
      expect(map_config).to be_valid
    end
  end

  describe "when mappable_type is 'CustomField' with input_type: 'point'" do
    it 'is valid' do
      map_config = build(:map_config, mappable: create(:custom_field_point))
      expect(map_config).to be_valid
    end
  end

  describe "when mappable_type is 'CustomField' with input_type other than 'point'" do
    it 'is invalid' do
      map_config = build(:map_config, mappable: create(:custom_field_text))
      expect(map_config).to be_invalid
    end
  end

  describe 'when mappable is nil' do
    it 'is invalid' do
      map_config = build(:map_config, mappable: nil)
      expect(map_config).to be_invalid
    end
  end
end
