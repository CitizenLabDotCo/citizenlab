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
      expect(project.title_multiloc['en']).to eq('Existing Project')
      expect(project.slug).to eq('existing-project')
    end

    it 'returns nil if the project cannot be found by id' do
      project_data[:id] = 'NON_EXISTENT_ID'
      project = service.send(:find_or_create_project, project_data)
      expect(project).to be_nil
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
end
