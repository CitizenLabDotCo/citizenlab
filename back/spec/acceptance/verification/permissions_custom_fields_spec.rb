# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'PermissionsCustomField' do
  before do
    header 'Content-Type', 'application/json'
    admin_header_token
    SettingsService.new.activate_feature! 'verification', settings: { verification_methods: [{ name: 'fake_sso', enabled_for_verified_actions: true }] }
  end

  get 'web_api/v1/ideas/:idea_id/permissions/:action/permissions_custom_fields' do
    let(:project) { create(:single_phase_ideation_project) }
    let(:action) { 'commenting_idea' }
    let(:idea_id) { create(:idea, project: project).id }

    example 'List all default permissions fields of a "verified" permission with locked fields' do
      permission = create(:permission, permission_scope: project.phases.first, action: action, permitted_by: 'verified', global_custom_fields: true)
      custom_field = create(:custom_field_gender, required: false, enabled: false)

      do_request

      assert_status 200
      expect(response_data.size).to eq 1
      expect(response_data.map { |d| d.dig(:attributes, :required) }).to eq [true]
      expect(response_data.map { |d| d.dig(:attributes, :lock) }).to eq ['verification']
      expect(response_data.map { |d| d.dig(:relationships, :permission, :data, :id) }).to contain_exactly(permission.id)
      expect(response_data.last.dig(:relationships, :custom_field, :data, :id)).to eq custom_field.id
    end
  end
end
