# frozen_string_literal: true

require 'rails_helper'

describe BulkImportIdeas::Importers::ProjectImporter do
  let(:service) { described_class.new(create(:admin), 'en') }

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
