# frozen_string_literal: true

require 'rails_helper'

describe BulkImportIdeas::Importers::ProjectImporter do
  let(:service) { described_class.new(create(:admin), 'en') }

  describe '#find_or_create_project' do
    let(:project_data) do
      {
        title_multiloc: { 'en' => 'Test Project' },
        slug: 'test-project',
        description_multiloc: { 'en' => 'This is a test project.' },
        admin_publication_attributes: { publication_status: 'published' }
      }
    end

    it 'creates a new project if it does not exist' do
      project = service.send(:find_or_create_project, project_data)
      expect(project.title_multiloc['en']).to eq('Test Project')
      expect(project.slug).to eq('test-project')
    end

    it 'finds an existing project if it exists by id' do
      existing_project = create(:project, title_multiloc: { 'en' => 'Existing Project' }, slug: 'existing-project')
      project_data[:id] = existing_project.id
      project = service.send(:find_or_create_project, project_data)
      expect(project.id).to eq existing_project.id
      expect(project.title_multiloc['en']).to eq('Existing Project')
      expect(project.slug).to eq('existing-project')
    end

    it 'returns nil if the project cannot be found by id' do
      project_data[:id] = 'NON_EXISTENT_ID'
      project = service.send(:find_or_create_project, project_data)
      expect(project).to be_nil
    end
  end

  describe '#find_or_create_phase' do
    let(:project) { create(:project, title_multiloc: { 'en' => 'Test Project' }, slug: 'test-project') }
    let(:phase_attributes) do
      {
        title_multiloc: { 'en' => 'Test Phase' },
        description_multiloc: { 'en' => 'This is a test phase.' },
        start_at: '2025-01-01',
        end_at: '2025-02-01'
      }
    end

    it 'creates a new phase if it does not exist' do
      phase = service.send(:find_or_create_phase, project, phase_attributes)
      expect(phase.project).to eq project
      expect(phase.title_multiloc['en']).to eq('Test Phase')
    end

    it 'finds an existing phase if it exists by id' do
      existing_phase = create(:native_survey_phase, project: project, title_multiloc: { 'en' => 'Existing Phase' })
      phase_attributes[:id] = existing_phase.id
      phase = service.send(:find_or_create_phase, project, phase_attributes)
      expect(phase.id).to eq existing_phase.id
      expect(phase.title_multiloc['en']).to eq('Existing Phase')
    end

    it 'returns nil if the phase cannot be found by id' do
      phase_attributes[:id] = 'NON_EXISTENT_ID'
      phase = service.send(:find_or_create_phase, project, phase_attributes)
      expect(phase).to be_nil
    end
  end

  describe '#create_form' do
    let(:phase) { create(:native_survey_phase, project: create(:project)) }

    it 'creates a new form for a native survey phase when it does not exist' do
      expect { service.send(:create_form, phase, []) }.to change(CustomForm, :count).by(1)
    end

    it 'does not create a form if the form already exists' do
      create(:custom_form, participation_context: phase)
      expect { service.send(:create_form, phase, []) }.not_to change(CustomForm, :count)
    end

    it 'does not create a form (no form needs to be created) if an ideation phase' do
      ideation_phase = create(:ideation_phase, project: create(:project))
      expect { service.send(:create_form, ideation_phase, []) }.not_to change(CustomForm, :count)
    end
  end

  describe '#increment_title' do
    let(:project_data) { { title_multiloc: { 'en' => 'Test Project' }, slug: 'test-project' } }
    let(:new_project_data) { service.send(:increment_title, project_data) }

    it 'increments the title with a number if it already exists' do
      create(:project, title_multiloc: { 'en' => 'Test Project' }, slug: 'test-project')
      expect(new_project_data[:slug]).to eq 'test-project-1'
      expect(new_project_data[:title_multiloc]['en']).to eq 'Test Project (1)'
    end

    it 'keeps incrementing the title until a unique one is found' do
      create(:project, title_multiloc: { 'en' => 'Test Project' }, slug: 'test-project')
      create(:project, title_multiloc: { 'en' => 'Test Project (1)' }, slug: 'test-project-1')
      expect(new_project_data[:slug]).to eq 'test-project-2'
      expect(new_project_data[:title_multiloc]['en']).to eq 'Test Project (2)'
    end

    it 'does not increment the title if it is unique' do
      create(:project, title_multiloc: { 'en' => 'Another Project' }, slug: 'another-project')
      new_project_data = service.send(:increment_title, project_data)
      expect(new_project_data[:slug]).to eq('test-project')
      expect(new_project_data[:title_multiloc]['en']).to eq('Test Project')
    end
  end

  describe '#extract_project_user_data' do
    let(:users) { [] }
    let(:user_custom_fields) { [] }
    let(:base_project_data) do
      {
        title_multiloc: { 'en' => 'Test Project' },
        phases: []
      }
    end

    it 'returns empty arrays when no user data exists' do
      projects = [base_project_data]
      result_users, result_custom_fields = service.send(:extract_project_user_data, projects, users, user_custom_fields)
      expect(result_users).to be_empty
      expect(result_custom_fields).to be_empty
    end

    it 'extracts user data from idea rows' do
      projects = [{
        **base_project_data,
        phases: [{
          idea_rows: [{
            'Email address' => 'test@example.com',
            'First Name(s)' => 'John',
            'Last Name' => 'Doe'
          }]
        }]
      }]

      result_users, = service.send(:extract_project_user_data, projects, users, user_custom_fields)
      expect(result_users.length).to eq(1)
      expect(result_users.first).to include(
        'Email address' => 'moc_elpmaxe_tset@example.com', # Email is replaced and reversed as we're on test
        'First Name(s)' => 'John',
        'Last Name' => 'Doe'
      )
    end

    it 'does not duplicate users with the same email' do
      existing_user = {
        'Email address' => 'test@example.com',
        'First Name(s)' => 'John',
        'Last Name' => 'Doe'
      }
      projects = [{
        **base_project_data,
        phases: [{
          idea_rows: [existing_user.dup]
        }]
      }]

      result_users, = service.send(:extract_project_user_data, projects, [existing_user], user_custom_fields)
      expect(result_users.length).to eq(1)
    end

    it 'merges user custom fields from phases if idea_rows are present' do
      custom_field = {
        title_multiloc: { 'en' => 'Custom Field' },
        key: 'custom_field'
      }
      projects = [{
        **base_project_data,
        phases: [{
          user_custom_fields: [custom_field],
          idea_rows: [{ 'Organization' => 'ACME Corp' }]
        }]
      }]

      _, result_custom_fields = service.send(:extract_project_user_data, projects, users, user_custom_fields)
      expect(result_custom_fields).to include(custom_field)
    end

    it 'extracts user custom field values from idea rows' do
      custom_field = {
        title_multiloc: { 'en' => 'Organization' },
        key: 'organization'
      }
      projects = [{
        **base_project_data,
        phases: [{
          user_custom_fields: [custom_field],
          idea_rows: [{
            'Email address' => 'test@example.com',
            'Organization' => 'ACME Corp'
          }]
        }]
      }]

      result_users, = service.send(:extract_project_user_data, projects, users, user_custom_fields)
      expect(result_users.first['Organization']).to eq('ACME Corp')
    end
  end
end
