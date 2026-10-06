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

      updated_question = fields.find { |f| f[:id] == question.id }
      updated_question[:title_multiloc] = { 'en' => 'New question' }

      added_question = { input_type: 'text', title_multiloc: { 'en' => 'Added question' }, required: false, enabled: true }
      fields.insert(-2, added_question) # before the form_end page

      response = run(
        container_type: 'phase',
        container_id: phase.id,
        fields: fields,
        fields_last_updated_at: fetched[:fields_last_updated_at]
      )

      expect(response).not_to be_error

      response.structured_content[:fields] => [
        { id: ^(page.id) },
        { id: ^(question.id), title_multiloc: ^({ 'en' => 'New question' }) },
        { id: added_id, input_type: 'text', title_multiloc: ^({ 'en' => 'Added question' }), required: false, enabled: true },
        { id: ^(end_page.id) }
      ]

      expect(CustomField.exists?(added_id)).to be(true)
      expect(CustomField.exists?(dropped_question.id)).to be(false)
      expect(question.reload.title_multiloc).to eq('en' => 'New question')
      expect(response.structured_content[:fields_last_updated_at]).to be > fetched[:fields_last_updated_at]
    end

    it 'ignores read-only keys instead of assigning them' do
      other_form = create(:custom_form)
      fetched = run_mcp_tool(
        McpServer::Tools::GetFormFields,
        params: { container_type: 'phase', container_id: phase.id },
        current_user:
      ).structured_content

      fields = fetched[:fields]
      fields.find { |f| f[:id] == question.id }[:resource_id] = other_form.id

      response = run(container_type: 'phase', container_id: phase.id, fields:)

      expect(response).not_to be_error
      expect(question.reload.resource_id).to eq(custom_form.id)
    end

    it 'refuses when responses have already been submitted' do
      create(:idea, project:, phases: [phase], creation_phase: phase)

      response = run(
        container_type: 'phase',
        container_id: phase.id,
        fields: [{ input_type: 'text', title_multiloc: { 'en' => 'Q' }, required: false, enabled: true }]
      )

      expect(response).to be_error
      expect(question.reload.title_multiloc).to eq('en' => 'Old question')
      expect(response.content.sole[:text])
        .to include('Cannot replace form fields: 1 response(s) already submitted')
    end

    it 'aborts on a stale fields_last_updated_at' do
      response = run(
        container_type: 'phase',
        container_id: phase.id,
        fields: [{ input_type: 'text', title_multiloc: { 'en' => 'Q' }, required: false, enabled: true }],
        fields_last_updated_at: 1.hour.ago(custom_form.fields_last_updated_at).iso8601
      )

      expect(response).to be_error
      expect(response.content.sole[:text]).to include('Call `get_form_fields` again')
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

  context 'with a community monitor phase' do
    let(:cm_phase) { create(:community_monitor_survey_phase) }

    def fetch_cm_fields
      run_mcp_tool(
        McpServer::Tools::GetFormFields,
        params: { container_type: 'phase', container_id: cm_phase.id },
        current_user:
      ).structured_content[:fields]
    end

    def replace_cm(fields)
      run(container_type: 'phase', container_id: cm_phase.id, fields:)
    end

    context 'on a demo platform' do
      before { change_lifecycle_stage('demo') }

      it 'adds a custom question on top, keeping the built-ins' do
        fields = fetch_cm_fields
        # Clone a built-in sentiment question so the custom one is structurally valid.
        custom_question = fields.find { |field| field[:key] == 'place_to_live' }.dup
        custom_question.delete(:id)
        custom_question[:key] = 'strategic_goal_1'
        custom_question[:title_multiloc] = { 'en' => 'How well are we meeting our strategic goal?' }
        fields.insert(-2, custom_question) # before the form_end page

        response = replace_cm(fields)

        expect(response).not_to be_error
        keys = response.structured_content[:fields].pluck(:key)
        expect(keys).to include('strategic_goal_1', 'place_to_live', 'page_quality_of_life')
      end

      it 'refuses to remove a built-in question' do
        fields = fetch_cm_fields.reject { |field| field[:key] == 'place_to_live' }

        response = replace_cm(fields)

        expect(response).to be_error
        expect(response.content.sole[:text]).to include('Cannot remove built-in community monitor field', 'place_to_live')
      end

      it 'refuses to remove a category page' do
        fields = fetch_cm_fields.reject { |field| field[:key] == 'page_service_delivery' }

        response = replace_cm(fields)

        expect(response).to be_error
        expect(response.content.sole[:text]).to include('Cannot remove built-in community monitor field', 'page_service_delivery')
      end

      it 'allows editing after responses exist and preserves their answers (continuous monitor)' do
        idea = create(:idea, project: cm_phase.project, phases: [cm_phase], creation_phase: cm_phase)
        answer = create(:custom_field_answer, answerable: idea, key: 'place_to_live', custom_field: nil, value: 3)

        response = replace_cm(fetch_cm_fields)

        expect(response).not_to be_error
        expect(CustomFieldAnswer.exists?(answer.id)).to be(true)
      end

      it 'updates persisted fields in place when payload ids are stale or missing' do
        expect(replace_cm(fetch_cm_fields)).not_to be_error
        persisted_ids = cm_phase.custom_form.custom_fields.pluck(:id)

        fields = fetch_cm_fields.each { |field| field.delete(:id) }
        response = replace_cm(fields)

        expect(response).not_to be_error
        expect(cm_phase.reload.custom_form.custom_fields.pluck(:id)).to match_array(persisted_ids)
      end

      it 'refuses to disable a built-in question' do
        fields = fetch_cm_fields
        fields.find { |field| field[:key] == 'place_to_live' }[:enabled] = false

        response = replace_cm(fields)

        expect(response).to be_error
        expect(response.content.sole[:text]).to include('Cannot disable or re-key built-in', 'place_to_live')
      end

      it 'accepts a faithful echo of a built-in that was already disabled elsewhere' do
        expect(replace_cm(fetch_cm_fields)).not_to be_error
        cm_phase.custom_form.custom_fields.find_by(key: 'access_to_parks').update!(enabled: false)

        response = replace_cm(fetch_cm_fields)

        expect(response).not_to be_error
        expect(cm_phase.custom_form.custom_fields.find_by(key: 'access_to_parks').enabled).to be(false)
      end

      it 'refuses a new field whose key collides with an existing field' do
        fields = fetch_cm_fields
        clashing = fields.find { |field| field[:key] == 'place_to_live' }.dup
        clashing.delete(:id)
        clashing[:title_multiloc] = { 'en' => 'Sneaky overwrite' }
        fields.insert(-2, clashing)

        response = replace_cm(fields)

        expect(response).to be_error
        expect(response.content.sole[:text]).to include('resolve to the same existing field', 'place_to_live')
        title = cm_phase.custom_form.custom_fields.find_by(key: 'place_to_live').title_multiloc
        expect(title).not_to eq('en' => 'Sneaky overwrite')
      end

      it 'allows removing a custom page even after responses exist' do
        fields = fetch_cm_fields
        fields.insert(-2, { input_type: 'page', page_layout: 'default', title_multiloc: { 'en' => 'Extra page' } })
        expect(replace_cm(fields)).not_to be_error
        create(:idea, project: cm_phase.project, phases: [cm_phase], creation_phase: cm_phase)

        response = replace_cm(fetch_cm_fields.reject { |field| field[:title_multiloc]['en'] == 'Extra page' })

        expect(response).not_to be_error
        expect(cm_phase.custom_form.custom_fields.reload.map { |field| field.title_multiloc['en'] }).not_to include('Extra page')
      end

      it 'keeps an unset question_category NULL on a faithful echo' do
        expect(replace_cm(fetch_cm_fields)).not_to be_error
        expect(replace_cm(fetch_cm_fields)).not_to be_error

        pages = cm_phase.custom_form.custom_fields.select(&:page?)
        expect(pages.map { |field| field.read_attribute(:question_category) }).to all(be_nil)
      end

      context 'with a custom question on the form' do
        def add_custom_question!
          fields = fetch_cm_fields
          custom_question = fields.find { |field| field[:key] == 'place_to_live' }.dup
          custom_question.delete(:id)
          custom_question[:key] = 'strategic_goal_1'
          custom_question[:title_multiloc] = { 'en' => 'How well are we meeting our strategic goal?' }
          fields.insert(-2, custom_question)
          expect(replace_cm(fields)).not_to be_error
        end

        it 'allows removing it while no responses exist' do
          add_custom_question!

          response = replace_cm(fetch_cm_fields.reject { |field| field[:key] == 'strategic_goal_1' })

          expect(response).not_to be_error
          expect(CustomField.find_by(key: 'strategic_goal_1')).to be_nil
        end

        it 'refuses to remove it once responses exist' do
          add_custom_question!
          create(:idea, project: cm_phase.project, phases: [cm_phase], creation_phase: cm_phase)

          response = replace_cm(fetch_cm_fields.reject { |field| field[:key] == 'strategic_goal_1' })

          expect(response).to be_error
          expect(response.content.sole[:text]).to include('permanently deletes its answers', 'strategic_goal_1')
          expect(CustomField.find_by(key: 'strategic_goal_1')).to be_present
        end

        it 'refuses to change its key once responses exist' do
          add_custom_question!
          create(:idea, project: cm_phase.project, phases: [cm_phase], creation_phase: cm_phase)

          fields = fetch_cm_fields
          fields.find { |field| field[:key] == 'strategic_goal_1' }[:key] = 'strategic_goal_renamed'
          response = replace_cm(fields)

          expect(response).to be_error
          expect(response.content.sole[:text]).to include('orphans its answers', 'strategic_goal_1')
        end
      end
    end

    it 'refuses on a non-demo/trial platform' do
      change_lifecycle_stage('active')

      response = replace_cm(fetch_cm_fields)

      expect(response).to be_unauthorized_project
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
    expect(titles).to eq([{}, { 'en' => 'First question' }, { 'en' => 'Second question' }, {}])
  end

  it 'refuses to drop a locked built-in field on an ideation form' do
    project = create(
      :project_with_active_ideation_phase,
      admin_publication_attributes: { publication_status: 'draft' }
    )

    # Structurally valid form (first page + form_end), but without the locked built-in
    # fields (title_multiloc, body_multiloc).
    response = run(
      container_type: 'project',
      container_id: project.id,
      fields: [
        { input_type: 'page', page_layout: 'default', title_multiloc: {} },
        { input_type: 'text', title_multiloc: { 'en' => 'Only question' }, required: false, enabled: true },
        { input_type: 'page', page_layout: 'default', key: 'form_end', title_multiloc: {} }
      ]
    )

    expect(response).to be_error
    expect(response.content.sole[:text]).to include('A locked built-in field is missing')
    expect(response.structured_content[:errors]).to eq(form: [{ error: 'locked_deletion' }])
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
