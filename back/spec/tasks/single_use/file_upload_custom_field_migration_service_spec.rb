# frozen_string_literal: true

require 'rails_helper'
require_relative '../../../lib/tasks/single_use/services/file_upload_custom_field_migration_service'

RSpec.describe Tasks::SingleUse::Services::FileUploadCustomFieldMigrationService do
  subject(:service) { described_class.new }

  describe '#migrate' do
    let!(:file_upload_custom_field) { create(:custom_field, input_type: 'file_upload', resource_type: 'CustomForm', key: 'file_upload_field') }
    let!(:idea_file) { create(:idea_file, name: 'myfile.pdf') }
    let!(:idea) { create(:idea, custom_field_values: { file_upload_custom_field.key => idea_file.id }) }

    context 'without persistence' do
      before { service.migrate(false) }

      it 'lists number of projects with no success' do
        expect(service.stats).to eq({ ideas: 1, file_fields: 1, ideas_updated: 0, errors: [] })
      end

      it 'does not change the custom field format' do
        expect(idea.reload.custom_field_values).to eq({ file_upload_custom_field.key => idea_file.id })
      end
    end

    context 'with persistence' do
      it 'shows the correct stats' do
        service.migrate(true)
        expect(service.stats).to eq({ ideas: 1, file_fields: 1, ideas_updated: 1, errors: [] })
      end

      it 'transforms file upload custom fields' do
        service.migrate(true)
        expect(idea.reload.custom_field_values).to eq({
          file_upload_custom_field.key => { 'id' => idea_file.id, 'name' => idea_file.name }
        })
      end

      it 'transforms file field but keeps other custom field values the same' do
        idea.update(custom_field_values: { 'another_field' => 'some value', file_upload_custom_field.key => idea_file.id })
        service.migrate(true)
        expect(idea.reload.custom_field_values).to match({
          'another_field' => 'some value',
          file_upload_custom_field.key => { 'id' => idea_file.id, 'name' => idea_file.name }
        })
      end
    end
  end
end
