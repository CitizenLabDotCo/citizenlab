# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ReportBuilder::Queries::ProjectsTimeline do
  let(:user) { create(:admin) }
  let(:query) { described_class.new(user) }

  describe '#run_query' do
    let!(:project1) { create(:project, title_multiloc: { en: 'Project 1' }) }
    let!(:project2) { create(:project, title_multiloc: { en: 'Project 2' }) }
    let!(:phase1) { create(:phase, project: project1, participation_method: 'information', start_at: 1.month.ago, end_at: 1.month.from_now) }
    let!(:phase2) { create(:phase, project: project2, start_at: 2.months.ago, end_at: 2.months.from_now) }

    before do
      # Ensure projects are published
      project1.admin_publication.update!(publication_status: 'published')
      project2.admin_publication.update!(publication_status: 'published')
    end

    it 'returns timeline data for projects' do
      result = query.run_query

      expect(result).to have_key(:timeline_items)
      expect(result[:timeline_items]).to be_an(Array)
    end

    it 'filters by publication status' do
      result = query.run_query({ status: ['published'] })

      timeline_items = result[:timeline_items]
      expect(timeline_items).not_to be_empty

      timeline_items.each do |item|
        expect(item[:publication_status]).to eq('published')
      end
    end

    it 'filters by participation states - informing' do
      result = query.run_query({ participation_states: ['informing'] })

      timeline_items = result[:timeline_items]
      expect(timeline_items).not_to be_empty
      # Should include project1 since it has a phase with participation_method: 'information'
      expect(timeline_items.map { |item| item[:id] }).to include(project1.id)
    end

    it 'filters by participation states - collecting_data' do
      # Create a project with a non-information phase
      project3 = create(:project, title_multiloc: { en: 'Project 3' })
      project3.admin_publication.update!(publication_status: 'published')
      create(:phase, project: project3, participation_method: 'ideation', start_at: 1.month.ago, end_at: 1.month.from_now)

      result = query.run_query({ participation_states: ['collecting_data'] })

      timeline_items = result[:timeline_items]
      expect(timeline_items).not_to be_empty
      # Should include project3 since it has a phase with participation_method: 'ideation' (not 'information')
      expect(timeline_items.map { |item| item[:id] }).to include(project3.id)
      # Should not include project1 since it has an 'information' phase
      expect(timeline_items.map { |item| item[:id] }).not_to include(project1.id)
    end

    it 'filters by visibility' do
      result = query.run_query({ visibility: ['public'] })

      timeline_items = result[:timeline_items]
      expect(timeline_items).not_to be_empty
      # Should include both projects since they are public by default
      expect(timeline_items.map { |item| item[:id] }).to include(project1.id, project2.id)
    end

    it 'filters by discoverability' do
      result = query.run_query({ discoverability: ['listed'] })

      timeline_items = result[:timeline_items]
      expect(timeline_items).not_to be_empty
      # Should include both projects since they are listed by default
      expect(timeline_items.map { |item| item[:id] }).to include(project1.id, project2.id)
    end

    it 'filters by participation methods' do
      result = query.run_query({ participation_methods: ['information'] })

      timeline_items = result[:timeline_items]
      expect(timeline_items).not_to be_empty
      # Should include project1 since it has a phase with participation_method: 'information'
      expect(timeline_items.map { |item| item[:id] }).to include(project1.id)
      # Should not include project2 since it doesn't have an information phase
      expect(timeline_items.map { |item| item[:id] }).not_to include(project2.id)
    end

    it 'filters by participation methods - ideation' do
      # Create a project with an ideation phase
      project3 = create(:project, title_multiloc: { en: 'Project 3' })
      project3.admin_publication.update!(publication_status: 'published')
      create(:phase, project: project3, participation_method: 'ideation', start_at: 1.month.ago, end_at: 1.month.from_now)

      result = query.run_query({ participation_methods: ['ideation'] })

      timeline_items = result[:timeline_items]
      expect(timeline_items).not_to be_empty
      # Should include project3 since it has a phase with participation_method: 'ideation'
      expect(timeline_items.map { |item| item[:id] }).to include(project3.id)
      # Should not include project1 since it has an 'information' phase
      expect(timeline_items.map { |item| item[:id] }).not_to include(project1.id)
    end

    it 'filters by folder ids' do
      # Create a folder and associate project1 with it
      folder = create(:project_folder)
      project1.update!(folder: folder)

      result = query.run_query({ folder_ids: [folder.id] })

      timeline_items = result[:timeline_items]
      expect(timeline_items).not_to be_empty
      expect(timeline_items.map { |item| item[:id] }).to include(project1.id)
    end

    it 'filters by managers' do
      # Create a user and make them a moderator of project1
      manager = create(:user)
      manager.add_role('project_moderator', { project_id: project1.id })
      manager.save!

      result = query.run_query({ managers: [manager.id] })

      timeline_items = result[:timeline_items]
      expect(timeline_items).not_to be_empty
      expect(timeline_items.map { |item| item[:id] }).to include(project1.id)
    end

    it 'returns all projects when no limit is specified' do
      result = query.run_query({})

      # Should return all available projects (2 in this test)
      expect(result[:timeline_items].length).to eq(2)
    end

    it 'limits the number of projects' do
      result = query.run_query({ no_of_projects: 1 })

      expect(result[:timeline_items].length).to eq(1)
    end

    it 'returns available projects when fewer than requested' do
      # Request more projects than exist
      result = query.run_query({ no_of_projects: 100 })

      # Should return all available projects (2 in this test)
      expect(result[:timeline_items].length).to eq(2)
    end

    it 'includes project timeline information' do
      result = query.run_query
      timeline_item = result[:timeline_items].find { |item| item[:id] == project1.id }

      expect(timeline_item).to be_present
      expect(timeline_item[:title]).to eq(project1.title_multiloc)
      expect(timeline_item[:start_date]).to be_present
      expect(timeline_item[:publication_status]).to eq(project1.admin_publication.publication_status)
    end

    context 'with exclusions' do
      let(:non_existent_project_id) { '00000000-0000-0000-0000-000000000000' }
      let(:non_existent_folder_id) { '11111111-1111-1111-1111-111111111111' }

      context 'by project IDs' do
        it 'excludes projects by their project IDs' do
          result = query.run_query({ excluded_project_ids: [project1.id] })

          timeline_items = result[:timeline_items]
          expect(timeline_items.map { |item| item[:id] }).not_to include(project1.id)
          expect(timeline_items.map { |item| item[:id] }).to include(project2.id)
        end

        it 'returns all projects when excluded_project_ids is empty' do
          result = query.run_query({ excluded_project_ids: [] })

          timeline_items = result[:timeline_items]
          expect(timeline_items.map { |item| item[:id] }).to include(project1.id, project2.id)
        end

        it 'handles non-existent project ID gracefully' do
          result = query.run_query({ excluded_project_ids: [non_existent_project_id] })

          timeline_items = result[:timeline_items]
          expect(timeline_items.map { |item| item[:id] }).to include(project1.id, project2.id)
        end

        it 'handles mixed valid and non-existent project IDs' do
          result = query.run_query({ excluded_project_ids: [project1.id, non_existent_project_id] })

          timeline_items = result[:timeline_items]
          expect(timeline_items.map { |item| item[:id] }).not_to include(project1.id)
          expect(timeline_items.map { |item| item[:id] }).to include(project2.id)
        end

        it 'handles multiple project exclusions' do
          result = query.run_query({ excluded_project_ids: [project1.id, project2.id] })

          timeline_items = result[:timeline_items]
          expect(timeline_items.map { |item| item[:id] }).not_to include(project1.id, project2.id)
          expect(timeline_items).to be_empty
        end
      end

      context 'by folder IDs' do
        let!(:folder) { create(:project_folder) }
        let!(:project_in_folder) { create(:project, folder: folder) }
        let!(:phase_in_folder) { create(:phase, project: project_in_folder, start_at: 1.month.ago, end_at: 1.month.from_now) }

        let!(:folder2) { create(:project_folder) }
        let!(:project_in_folder2) { create(:project, folder: folder2) }
        let!(:phase_in_folder2) { create(:phase, project: project_in_folder2, start_at: 1.month.ago, end_at: 1.month.from_now) }

        before do
          project_in_folder.admin_publication.update!(publication_status: 'published')
          project_in_folder2.admin_publication.update!(publication_status: 'published')
        end

        it 'excludes projects within excluded folders' do
          result = query.run_query({ excluded_folder_ids: [folder.id] })

          timeline_items = result[:timeline_items]
          expect(timeline_items.map { |item| item[:id] }).not_to include(project_in_folder.id)
          expect(timeline_items.map { |item| item[:id] }).to include(project1.id, project2.id)
        end

        it 'returns all projects when excluded_folder_ids is empty' do
          result = query.run_query({ excluded_folder_ids: [] })

          timeline_items = result[:timeline_items]
          expect(timeline_items.map { |item| item[:id] }).to include(project_in_folder.id, project1.id, project2.id)
        end

        it 'handles non-existent folder ID gracefully' do
          result = query.run_query({ excluded_folder_ids: [non_existent_folder_id] })

          timeline_items = result[:timeline_items]
          expect(timeline_items.map { |item| item[:id] }).to include(project_in_folder.id, project_in_folder2.id, project1.id, project2.id)
        end

        it 'handles mixed valid and non-existent folder IDs' do
          result = query.run_query({ excluded_folder_ids: [folder.id, non_existent_folder_id] })

          timeline_items = result[:timeline_items]
          expect(timeline_items.map { |item| item[:id] }).not_to include(project_in_folder.id)
          expect(timeline_items.map { |item| item[:id] }).to include(project_in_folder2.id, project1.id, project2.id)
        end

        it 'handles multiple folder exclusions' do
          result = query.run_query({ excluded_folder_ids: [folder.id, folder2.id] })

          timeline_items = result[:timeline_items]
          expect(timeline_items.map { |item| item[:id] }).not_to include(project_in_folder.id, project_in_folder2.id)
          expect(timeline_items.map { |item| item[:id] }).to include(project1.id, project2.id)
        end
      end

      context 'by both project and folder IDs' do
        let!(:folder) { create(:project_folder) }
        let!(:project_in_folder) { create(:project, folder: folder) }
        let!(:phase_in_folder) { create(:phase, project: project_in_folder, start_at: 1.month.ago, end_at: 1.month.from_now) }

        let!(:folder2) { create(:project_folder) }
        let!(:project_in_folder2) { create(:project, folder: folder2) }
        let!(:phase_in_folder2) { create(:phase, project: project_in_folder2, start_at: 1.month.ago, end_at: 1.month.from_now) }

        before do
          project_in_folder.admin_publication.update!(publication_status: 'published')
          project_in_folder2.admin_publication.update!(publication_status: 'published')
        end

        it 'excludes both projects by ID and projects in folders' do
          result = query.run_query({
            excluded_project_ids: [project1.id],
            excluded_folder_ids: [folder.id]
          })

          timeline_items = result[:timeline_items]
          expect(timeline_items.map { |item| item[:id] }).not_to include(project1.id, project_in_folder.id)
          expect(timeline_items.map { |item| item[:id] }).to include(project2.id, project_in_folder2.id)
        end

        it 'handles redundant exclusion of project and its folder' do
          result = query.run_query({
            excluded_project_ids: [project_in_folder.id],
            excluded_folder_ids: [folder.id]
          })

          timeline_items = result[:timeline_items]
          expect(timeline_items.map { |item| item[:id] }).not_to include(project_in_folder.id)
          expect(timeline_items.map { |item| item[:id] }).to include(project1.id, project2.id, project_in_folder2.id)
        end

        it 'handles multiple projects and multiple folders exclusions simultaneously' do
          result = query.run_query({
            excluded_project_ids: [project1.id, project2.id],
            excluded_folder_ids: [folder.id, folder2.id]
          })

          timeline_items = result[:timeline_items]
          expect(timeline_items.map { |item| item[:id] }).not_to include(
            project1.id,
            project2.id,
            project_in_folder.id,
            project_in_folder2.id
          )
          expect(timeline_items).to be_empty
        end

        it 'handles combined exclusions with non-existent IDs' do
          result = query.run_query({
            excluded_project_ids: [project1.id, non_existent_project_id],
            excluded_folder_ids: [folder.id, non_existent_folder_id]
          })

          timeline_items = result[:timeline_items]
          expect(timeline_items.map { |item| item[:id] }).not_to include(project1.id, project_in_folder.id)
          expect(timeline_items.map { |item| item[:id] }).to include(project2.id, project_in_folder2.id)
        end
      end
    end
  end
end
