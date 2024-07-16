# frozen_string_literal: true

require 'rails_helper'

RSpec.describe CustomMaps::MapConfig do
  describe 'Default factory' do
    it 'is valid' do
      map_config = build(:map_config)
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

  # Permitted so that we can create a map_config, before creating the (to be) associated mappable (custom_field) for a
  # custom field used in a native survey, as the custom field(s) is/are created only when the survey form is submitted.
  describe 'when mappable is nil' do
    it 'is valid' do
      map_config = build(:map_config, mappable: nil)
      expect(map_config).to be_valid
    end
  end

  describe 'when mappable_type is given, but mappable_id is nil' do
    it 'is invalid' do
      map_config = build(:map_config, mappable_type: 'Project', mappable_id: nil)
      expect(map_config).to be_invalid
    end
  end

  describe 'when mappable_id is given, but mappable_type is nil' do
    it 'is invalid' do
      project = create(:project)
      map_config = build(:map_config, mappable_type: nil, mappable_id: project.id)
      expect(map_config).to be_invalid
    end
  end

  describe 'when mappable_type and mappable_id given, but mappable does not exist' do
    it 'is invalid' do
      map_config = build(:map_config, mappable_type: 'Project', mappable_id: SecureRandom.uuid)
      expect(map_config).to be_invalid
    end
  end

  describe 'when mappable (ID) is not unique' do
    it 'is invalid' do
      project = create(:project)
      create(:map_config, mappable: project)
      map_config = build(:map_config, mappable: project)
      expect(map_config).to be_invalid
    end
  end
end
