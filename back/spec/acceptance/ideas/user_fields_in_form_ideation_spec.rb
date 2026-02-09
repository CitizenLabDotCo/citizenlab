# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'
require_relative 'shared_examples/user_fields_in_form_for_ideationlike_methods'

resource 'Ideas' do
  before do
    header 'Content-Type', 'application/json'
    create(:idea_status_proposed)
  end

  post 'web_api/v1/ideas' do
    before do
      # Create project with form
      @project = create(:single_phase_ideation_project, phase_attrs: { with_permissions: true })
      @phase = @project.phases.first
      @phase.permissions.find_by(action: 'posting_idea').update!(
        global_custom_fields: false
      )

      @permission = @phase.permissions.find_by(action: 'posting_idea')
      @custom_form = create(:custom_form, :with_default_fields, participation_context: @project)

      # Create registration (demographic) question and
      # add to permission
      @user_select_field = create(
        :custom_field_select,
        :for_registration,
        :with_options,
        key: 'select_field',
        enabled: true
      )
      create(:permissions_custom_field, custom_field: @user_select_field, permission: @permission)
    end

    include_examples 'user fields in form for input methods'
  end
end
