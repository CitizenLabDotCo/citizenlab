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

    describe 'when project description contains images' do
      let(:project_data) do
        {
          title_multiloc: { 'en' => 'Test Project' },
          slug: 'test-project',
          description_multiloc: {
            'en' => html_with_base64_image
          },
          admin_publication_attributes: { publication_status: 'published' }
        }
      end

      it 'creates a project with description containing images and processes text images' do
        project = service.send(:find_or_create_project, project_data)
        expect(project.title_multiloc['en']).to eq('Test Project')
        expect(project.description_multiloc['en']).to include('<p>Some text</p><img alt="Red dot"')

        text_image = TextImage.find_by(imageable_id: project.id, imageable_type: 'Project', imageable_field: 'description_multiloc')
        expect(text_image).to be_present
        expect(project.description_multiloc['en']).to include("data-cl2-text-image-text-reference=\"#{text_image.text_reference}\"")
      end
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

  describe '#create_project_attachments' do
    let(:project) { create(:project) }

    it 'imports attachments from local file path' do
      # Ensure fixture files do not get deleted during tests
      allow(File).to receive(:delete)

      project_data = {
        attachments: [
          Rails.root.join('engines/commercial/bulk_import_ideas/spec/fixtures/scan_1.pdf').to_s,
          Rails.root.join('engines/commercial/bulk_import_ideas/spec/fixtures/import.xlsx').to_s
        ]
      }
      service.send(:create_project_attachments, project, project_data)

      expect(project.file_attachments.count).to eq(2)

      file1 = project.file_attachments.first
      expect(file1.position).to eq(0)
      expect(file1.file.name).to eq('scan_1.pdf')
      expect(file1.file.mime_type).to eq('application/pdf')

      file2 = project.file_attachments.last
      expect(file2.position).to eq(1)
      expect(file2.file.name).to eq('import.xlsx')
      expect(file2.file.mime_type).to eq('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    end
  end

  describe '#create_project_banner_image' do
    let(:project) { create(:project) }

    it 'imports banner image from local file path' do
      project_data = {
        banner_url: Rails.root.join('engines/commercial/bulk_import_ideas/spec/fixtures/banner.jpg').to_s
      }
      service.send(:create_project_banner_image, project, project_data)

      expect(project.header_bg).to be_present
      file_path = project.header_bg.file.file
      expect(file_path).to include(project.id)
      expect(file_path).to end_with('.jpeg')
    end
  end

  describe '#create_description_content_builder_layout' do
    let(:project) { create(:project) }

    it 'creates a description builder layout for the project' do
      service.send(:create_description_content_builder_layout, project)

      expect(ContentBuilder::Layout.count).to eq(1)
      expect(ContentBuilder::Layout.first.content_buildable).to eq(project)
    end
  end
end
