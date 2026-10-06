# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Analytics::Reporting::Project do
  subject(:row) { described_class.find(project.id) }

  let!(:project) { create(:project, title_multiloc: { 'en' => 'Park renewal', 'nl-BE' => 'Parkvernieuwing' }) }

  describe 'title' do
    it 'resolves to the tenant primary locale' do
      expect(row.title).to eq 'Park renewal'
    end

    it 'also exposes the raw multiloc' do
      expect(row.title_multiloc).to eq('en' => 'Park renewal', 'nl-BE' => 'Parkvernieuwing')
    end

    it 'falls back to another locale when the primary locale is missing' do
      project.update!(title_multiloc: { 'nl-BE' => 'Parkvernieuwing' })

      expect(row.title).to eq 'Parkvernieuwing'
    end
  end

  describe 'publication_status' do
    it 'exposes the admin publication status' do
      draft = create(:project, :draft)

      expect(row.publication_status).to eq 'published'
      expect(described_class.find(draft.id).publication_status).to eq 'draft'
    end
  end

  describe 'start_at / end_at' do
    it 'is NULL for a project without phases' do
      expect(row.start_at).to be_nil
      expect(row.end_at).to be_nil
    end

    it 'spans from the earliest phase start to the latest phase end' do
      create(:phase, project: project, start_at: '2026-01-01', end_at: '2026-01-31')
      create(:phase, project: project, start_at: '2026-02-01', end_at: '2026-03-31')

      expect(row.start_at).to eq project.phases.minimum(:start_at)
      expect(row.end_at).to eq project.phases.maximum(:end_at)
    end

    it 'has a NULL end when any phase is open-ended' do
      create(:phase, project: project, start_at: '2026-01-01', end_at: '2026-01-31')
      create(:phase, project: project, start_at: '2026-02-01', end_at: nil)

      expect(row.start_at).to eq project.phases.minimum(:start_at)
      expect(row.end_at).to be_nil
    end
  end

  describe 'folder_id' do
    it 'is NULL for a project outside any folder' do
      expect(row.folder_id).to be_nil
    end

    it 'is the folder id for a project in a folder' do
      folder = create(:project_folder, projects: [project])

      expect(row.folder_id).to eq folder.id
    end
  end

  describe 'folder_title' do
    it 'is NULL for a project outside any folder' do
      expect(row.folder_title).to be_nil
    end

    it 'is the folder title for a project in a folder' do
      create(:project_folder, projects: [project], title_multiloc: { 'en' => 'Recovery' })

      expect(row.folder_title).to eq 'Recovery'
    end
  end

  describe 'topics' do
    it 'is empty when the project has no topics' do
      expect(row.topics).to eq []
    end

    it 'lists the topic titles in topic order' do
      project.global_topics << create(:global_topic, title_multiloc: { 'en' => 'Nature' }, ordering: 2)
      project.global_topics << create(:global_topic, title_multiloc: { 'en' => 'Mobility' }, ordering: 1)

      expect(row.topics).to eq %w[Mobility Nature]
    end
  end

  describe 'areas' do
    let!(:north) { create(:area, title_multiloc: { 'en' => 'North' }) }

    before { create(:area, title_multiloc: { 'en' => 'South' }) }

    it 'lists only the linked areas' do
      project.areas << north

      expect(row.areas).to eq %w[North]
    end

    it 'lists every area for a project about all areas' do
      project.update!(include_all_areas: true)

      expect(row.areas).to match_array %w[North South]
    end
  end

  describe 'participation_methods' do
    it 'is empty for a project without phases' do
      expect(row.participation_methods).to eq []
    end

    it 'lists each method once, in timeline order' do
      create(:information_phase, project: project, start_at: '2026-01-01', end_at: '2026-01-31')
      create(:native_survey_phase, project: project, start_at: '2026-02-01', end_at: '2026-02-28')
      create(:information_phase, project: project, start_at: '2026-03-01', end_at: '2026-03-31')

      expect(row.participation_methods).to eq %w[information native_survey]
    end
  end

  it 'exposes the visibility flags' do
    expect(row.hidden).to be false
    expect(row.listed).to be true
    expect(row.visible_to).to eq 'public'
  end

  it 'exposes the creation and first publication timestamps' do
    expect(row.created_at).to eq project.reload.created_at
    expect(row.first_published_at).to eq project.admin_publication.first_published_at
    expect(row.first_published_at).to be_present
  end
end
