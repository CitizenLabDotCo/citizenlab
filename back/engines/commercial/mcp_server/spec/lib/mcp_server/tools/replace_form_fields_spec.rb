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

      it 'allows removing a built-in question while no responses exist' do
        fields = fetch_cm_fields.reject { |field| field[:key] == 'place_to_live' }

        response = replace_cm(fields)

        expect(response).not_to be_error
        expect(response.structured_content[:fields].pluck(:key)).not_to include('place_to_live')
      end

      it 'allows removing a category page while no responses exist' do
        fields = fetch_cm_fields.reject { |field| field[:key] == 'page_service_delivery' }

        response = replace_cm(fields)

        expect(response).not_to be_error
        expect(response.structured_content[:fields].pluck(:key)).not_to include('page_service_delivery')
      end

      it 'refuses to remove a built-in question once responses exist' do
        create(:idea, project: cm_phase.project, phases: [cm_phase], creation_phase: cm_phase)

        fields = fetch_cm_fields.reject { |field| field[:key] == 'place_to_live' }
        response = replace_cm(fields)

        expect(response).to be_error
        expect(response.content.sole[:text]).to include('permanently deletes its answers', 'place_to_live')
      end

      it 'allows editing after responses exist and preserves their answers (continuous monitor)' do
        idea = create(:idea, project: cm_phase.project, phases: [cm_phase], creation_phase: cm_phase)
        place_to_live = cm_phase.pmethod.create_default_form!.custom_fields.find_by!(key: 'place_to_live')
        answer = create(:custom_field_answer, answerable: idea, custom_field: place_to_live, value: 3)

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

      it 'allows disabling a built-in question' do
        fields = fetch_cm_fields
        fields.find { |field| field[:key] == 'place_to_live' }[:enabled] = false

        response = replace_cm(fields)

        expect(response).not_to be_error
        expect(cm_phase.custom_form.custom_fields.find_by(key: 'place_to_live').enabled).to be(false)
      end

      it 'treats a same-key field of a different type as a removal, not an update' do
        expect(replace_cm(fetch_cm_fields)).not_to be_error
        create(:idea, project: cm_phase.project, phases: [cm_phase], creation_phase: cm_phase)

        fields = fetch_cm_fields.reject { |field| field[:key] == 'place_to_live' }
        fields.insert(1, { input_type: 'page', page_layout: 'default', key: 'place_to_live', title_multiloc: { 'en' => 'Now a page' } })

        response = replace_cm(fields)

        expect(response).to be_error
        expect(response.content.sole[:text]).to include('place_to_live')
        expect(cm_phase.custom_form.custom_fields.find_by(key: 'place_to_live').input_type).to eq('sentiment_linear_scale')
      end

      it 'refuses a new field whose key collides with an existing field' do
        expect(replace_cm(fetch_cm_fields)).not_to be_error
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

  context 'with an ideation project' do
    let(:ideation_project) do
      create(:project_with_active_ideation_phase, admin_publication_attributes: { publication_status: 'draft' })
    end

    def fetch_ideation_fields
      run_mcp_tool(
        McpServer::Tools::GetFormFields,
        params: { container_type: 'project', container_id: ideation_project.id },
        current_user:
      ).structured_content[:fields]
    end

    def replace_ideation(fields)
      run(container_type: 'project', container_id: ideation_project.id, fields:)
    end

    it 'adds a question to a form that was never saved' do
      fields = fetch_ideation_fields
      fields.insert(-2, { input_type: 'text', title_multiloc: { 'en' => 'Added question' }, required: false, enabled: true })

      response = replace_ideation(fields)

      expect(response).not_to be_error
      stored = CustomForm.find_by(participation_context: ideation_project).custom_fields
      expect(stored.pluck(:title_multiloc)).to include('en' => 'Added question')
      built_in_titles = stored.where(code: %w[title_multiloc body_page]).pluck(:title_multiloc)
      expect(built_in_titles.map(&:keys)).to all(match_array(CL2_SUPPORTED_LOCALES.map(&:to_s)))
    end

    it 'edits a question of a saved form, keeping its title in a locale that is not active' do
      form = ideation_project.pmethod.create_default_form!
      question = create(:custom_field, resource: form, title_multiloc: { 'en' => 'Old question', 'es-ES' => 'Pregunta' })
      ids_before = form.custom_fields.pluck(:id)
      fields = fetch_ideation_fields
      # The question was added after the end page: move it in front.
      edited = fields.delete(fields.find { |field| field[:id] == question.id })
      edited[:title_multiloc] = { 'en' => 'New question' }
      fields.insert(-2, edited)

      response = replace_ideation(fields)

      expect(response).not_to be_error
      expect(question.reload.title_multiloc).to eq('en' => 'New question', 'es-ES' => 'Pregunta')
      expect(form.custom_fields.reload.pluck(:id)).to match_array(ids_before)
    end

    it 'refuses to change the title of a built-in field' do
      fields = fetch_ideation_fields
      fields.find { |field| field[:code] == 'title_multiloc' }[:title_multiloc] = { 'en' => 'Renamed' }

      response = replace_ideation(fields)

      expect(response).to be_error
      expect(response.structured_content[:errors]).to eq(form: [{ error: 'locked_attribute' }])
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
    default_end_title = MultilocService.new.i18n_to_multiloc('form_builder.form_end_page.title_text_3')
    # The end page in the payload is the default one, which keeps its title.
    expect(titles).to eq([{}, { 'en' => 'First question' }, { 'en' => 'Second question' }, default_end_title])
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

  it 'leaves no form behind when replacing the fields of a project without a form fails' do
    project = create(
      :project_with_active_ideation_phase,
      admin_publication_attributes: { publication_status: 'draft' }
    )

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
    expect(CustomForm.exists?(participation_context: project)).to be(false)
  end

  it 'rolls back the default fields materialized for a community monitor when the replace fails' do
    change_lifecycle_stage('demo')
    cm_phase = create(:community_monitor_survey_phase)

    response = run(
      container_type: 'phase',
      container_id: cm_phase.id,
      fields: [{ input_type: 'text', title_multiloc: { 'en' => 'Q' }, required: false, enabled: true }]
    )

    expect(response).to be_error
    expect(CustomForm.exists?(participation_context: cm_phase)).to be(false)
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
