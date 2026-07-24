# frozen_string_literal: true

require 'rails_helper'

describe McpServer::Tools::ReplaceFormFields do
  let_it_be(:current_user) { create(:super_admin) }

  let(:project) { create(:project, :draft) }
  let(:phase) { create(:native_survey_phase, project:) }
  let!(:custom_form) { create(:custom_form, participation_context: phase) }

  def run(params)
    run_mcp_tool(described_class, params:, current_user:)
  end

  context 'with a native survey phase' do
    let!(:page) { create(:custom_field_page, resource: custom_form, page_layout: 'default') }
    let!(:question) { create(:custom_field, resource: custom_form, title_multiloc: { 'en' => 'Old question' }) }
    let!(:dropped_question) { create(:custom_field, resource: custom_form) }
    let!(:end_page) { create(:custom_field_page, resource: custom_form, key: 'form_end') }

    it 'round-trips the fields returned by get_form_fields' do
      fetched = run_mcp_tool(
        McpServer::Tools::GetFormFields,
        params: { container_type: 'phase', container_id: phase.id },
        current_user:
      ).structured_content

      fields = fetched[:fields].reject { |f| f[:id] == dropped_question.id }
      fields = fields.map do |field|
        next field unless field[:id] == question.id

        field.merge(title_multiloc: { 'en' => 'New question' })
      end
      added = { input_type: 'text', title_multiloc: { 'en' => 'Added question' }, required: false, enabled: true }
      fields.insert(-2, added) # before the form_end page

      response = run(
        container_type: 'phase',
        container_id: phase.id,
        fields: fields,
        fields_last_updated_at: fetched[:fields_last_updated_at]
      )

      expect(response).not_to be_error
      expect(question.reload.title_multiloc).to eq('en' => 'New question')
      expect(CustomField.exists?(dropped_question.id)).to be(false)

      returned_titles = response.structured_content[:fields].pluck(:title_multiloc)
      expect(returned_titles).to include('en' => 'Added question')
      expect(response.structured_content[:fields_last_updated_at]).to be_present
    end

    it 'refuses when responses have already been submitted' do
      create(:idea, project:, phases: [phase], creation_phase: phase)

      response = run(
        container_type: 'phase',
        container_id: phase.id,
        fields: [{ input_type: 'text', title_multiloc: { 'en' => 'Q' }, required: false, enabled: true }]
      )

      expect(response).to be_error
      expect(response.content.first[:text]).to include('already')
      expect(question.reload.title_multiloc).to eq('en' => 'Old question')
    end

    it 'aborts on a stale fields_last_updated_at' do
      response = run(
        container_type: 'phase',
        container_id: phase.id,
        fields: [{ input_type: 'text', title_multiloc: { 'en' => 'Q' }, required: false, enabled: true }],
        fields_last_updated_at: 1.hour.ago(custom_form.fields_last_updated_at).iso8601
      )

      expect(response).to be_error
      expect(question.reload.title_multiloc).to eq('en' => 'Old question')
    end

    it 'refuses when the project is published' do
      project.admin_publication.update!(publication_status: 'published')

      response = run(
        container_type: 'phase',
        container_id: phase.id,
        fields: []
      )

      expect(response).to be_unauthorized_project
      expect(CustomField.exists?(question.id)).to be(true)
    end
  end

  it 'creates fields from scratch on an empty form' do
    response = run(
      container_type: 'phase',
      container_id: phase.id,
      fields: [
        { input_type: 'page', page_layout: 'default', title_multiloc: {} },
        { input_type: 'text', title_multiloc: { 'en' => 'First question' }, required: false, enabled: true },
        { input_type: 'text', title_multiloc: { 'en' => 'Second question' }, required: false, enabled: true },
        { input_type: 'page', page_layout: 'default', key: 'form_end', title_multiloc: {} }
      ]
    )

    expect(response).not_to be_error
    titles = custom_form.reload.custom_fields.order(:ordering).pluck(:title_multiloc)
    expect(titles).to include({ 'en' => 'First question' }, { 'en' => 'Second question' })
    expect(titles.index('en' => 'First question')).to be < titles.index('en' => 'Second question')
  end

  it 'refuses to drop a locked built-in field on an ideation form' do
    project = create(:project_with_active_ideation_phase, admin_publication_attributes: { publication_status: 'draft' })

    response = run(
      container_type: 'project',
      container_id: project.id,
      fields: [{ input_type: 'text', title_multiloc: { 'en' => 'Only question' }, required: false, enabled: true }]
    )

    expect(response).to be_error
  end

  it 'returns an error for an unsupported participation method' do
    phase = create(:information_phase, project: create(:project, :draft))

    response = run(
      container_type: 'phase',
      container_id: phase.id,
      fields: []
    )

    expect(response).to be_error
    expect(response.content.first[:text]).to include("Unsupported participation method: 'information'")
  end

  it 'returns a not-found error when the container is missing' do
    response = run(
      container_type: 'phase',
      container_id: SecureRandom.uuid,
      fields: []
    )

    expect(response).to be_not_found('Container (phase)')
  end
end
