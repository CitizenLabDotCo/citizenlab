# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ReportBuilder::Queries::Projects do
  let(:user) { create(:admin) }
  let(:query) { described_class.new(user) }

  describe '#run_query' do
    before_all do
      # Populate analytics dimension types for participation sorting
      Analytics::PopulateDimensionsService.populate_types

      # 2020
      @past_project = create(:project)
      create(
        :phase,
        project: @past_project,
        start_at: Date.new(2020, 2, 1),
        end_at: Date.new(2020, 3, 1),
        with_permissions: true
      )

      # 2021
      @project1 = create(:project, title_multiloc: { 'en' => 'Alpha', 'fr-FR' => 'Zeta' })
      create(:phase, project: @project1, start_at: Date.new(2021, 2, 1), end_at: Date.new(2021, 3, 1))
      create_list(:idea, 5, project: @project1)

      @project2 = create(:project, title_multiloc: { 'en' => 'Zeta', 'fr-FR' => 'Alpha' })
      create(:phase, project: @project2, start_at: Date.new(2021, 2, 1), end_at: Date.new(2021, 3, 1))
      create(:phase, project: @project2, start_at: Date.new(2021, 3, 2), end_at: nil)
      create_list(:idea, 10, project: @project2)

      # 2022
      @project3 = create(:project)
      create(:phase, project: @project3, start_at: Date.new(2022, 2, 1), end_at: nil)

      # Draft project
      project4 = create(:project)
      project4.admin_publication.update!(publication_status: 'draft')
      create(:phase, project: project4, start_at: Date.new(2022, 2, 1), end_at: nil)

      # Archived project
      @project5 = create(:project)
      @project5.admin_publication.update!(publication_status: 'archived')
      create(:phase, project: @project5, start_at: Date.new(2022, 2, 1), end_at: nil)

      # Empty project
      create(:project)

      # Community monitor project - should not be returned
      create(:community_monitor_project)

      # Make TimeBoundariesParser work as expected
      AppConfiguration.instance.update!(
        created_at: Date.new(2019, 12, 31),
        platform_start_at: Date.new(2019, 12, 31)
      )

      # Add project image
      create(:project_image, project: @project1)
    end

    context 'with date range filtering' do
      it 'returns projects with phases overlapping the date range' do
        result = query.run_query(
          start_at: Date.new(2021, 1, 1),
          end_at: Date.new(2021, 4, 1),
          publication_statuses: %w[published]
        )

        expect(result[:projects].count).to eq(2)
        expect(result[:projects].pluck(:id)).to contain_exactly(@project1.id, @project2.id)
      end

      it 'returns projects with ongoing phases (NULL end_at)' do
        result = query.run_query(
          start_at: Date.new(2022, 1, 1),
          end_at: Date.new(2022, 4, 1),
          publication_statuses: %w[published]
        )

        expect(result[:projects].count).to eq(2)
        expect(result[:projects].pluck(:id)).to contain_exactly(@project2.id, @project3.id)
      end

      it 'returns projects with ongoing phases in future date ranges' do
        result = query.run_query(
          start_at: Date.new(2025, 1, 1),
          end_at: Date.new(2025, 12, 31),
          publication_statuses: %w[published]
        )

        expect(result[:projects].count).to eq(2)
        expect(result[:projects].pluck(:id)).to contain_exactly(@project2.id, @project3.id)
      end

      it 'returns empty results when no phases overlap the date range' do
        result = query.run_query(
          start_at: Date.new(1989, 1, 1),
          end_at: Date.new(1990, 12, 31),
          publication_statuses: %w[published]
        )

        expect(result[:projects]).to be_empty
        expect(result[:periods]).to be_empty
        expect(result[:participants]).to be_empty
      end

      it 'excludes projects with phases that ended before the query range' do
        result = query.run_query(
          start_at: Date.new(2021, 4, 1),
          end_at: Date.new(2021, 5, 1),
          publication_statuses: %w[published]
        )

        expect(result[:projects].pluck(:id)).not_to include(@project1.id)
      end

      it 'excludes projects with phases that start after the query range' do
        result = query.run_query(
          start_at: Date.new(2019, 1, 1),
          end_at: Date.new(2019, 1, 31),
          publication_statuses: %w[published]
        )

        expect(result[:projects].pluck(:id)).not_to include(@past_project.id)
      end

      it 'returns all published projects when no date range is specified' do
        result = query.run_query(
          start_at: nil,
          end_at: nil,
          publication_statuses: %w[published]
        )

        expect(result[:projects].count).to eq(4)
        expect(result[:projects].pluck(:id)).to contain_exactly(@project1.id, @project2.id, @project3.id, @past_project.id)
      end
    end

    it 'returns project images' do
      result = query.run_query(
        start_at: Date.new(2021, 1, 1),
        end_at: Date.new(2021, 4, 1),
        publication_statuses: %w[published]
      )

      expect(result[:project_images].count).to eq(1)
    end

    it 'returns correct project periods' do
      result = query.run_query(
        start_at: Date.new(2021, 1, 1),
        end_at: Date.new(2021, 4, 1),
        publication_statuses: %w[published]
      )

      expect(result[:periods].count).to eq(2)
      expect(result[:periods][@project1.id]).to eq({
        'start_at' => Date.new(2021, 2, 1),
        'end_at' => Date.new(2021, 3, 1)
      })
      expect(result[:periods][@project2.id]).to eq({
        'start_at' => Date.new(2021, 2, 1),
        'end_at' => nil
      })
    end

    context 'when sorting is applied' do
      let(:start_at) { Date.new(2021, 1, 1) }
      let(:end_at) { Date.new(2021, 4, 1) }

      it 'sorts projects alphabetically in ascending order' do
        result = query.run_query(start_at: start_at, end_at: end_at, sort: 'alphabetically_asc')

        expect(result[:projects].pluck(:id)).to eq([@project1.id, @project2.id])
      end

      it 'sorts projects alphabetically in descending order' do
        result = query.run_query(start_at: start_at, end_at: end_at, sort: 'alphabetically_desc')

        expect(result[:projects].pluck(:id)).to eq([@project2.id, @project1.id])
      end

      it 'sorts projects alphabetically using the specified locale' do
        result_en = query.run_query(
          start_at: start_at,
          end_at: end_at,
          sort: 'alphabetically_asc',
          locale: 'en'
        )

        result_fr = query.run_query(
          start_at: start_at,
          end_at: end_at,
          sort: 'alphabetically_asc',
          locale: 'fr-FR'
        )

        expect(result_en[:projects].pluck(:id)).to eq([@project1.id, @project2.id])
        expect(result_fr[:projects].pluck(:id)).to eq([@project2.id, @project1.id])
      end

      it 'sorts projects by participation count in ascending order' do
        result = query.run_query(start_at: start_at, end_at: end_at, sort: 'participation_asc')

        expect(result[:projects].pluck(:id)).to eq([@project1.id, @project2.id])
      end

      it 'sorts projects by participation count in descending order' do
        result = query.run_query(start_at: start_at, end_at: end_at, sort: 'participation_desc')

        expect(result[:projects].pluck(:id)).to eq([@project2.id, @project1.id])
      end

      it 'returns unsorted projects when no sort parameter is provided' do
        result = query.run_query(start_at: start_at, end_at: end_at)

        expect(result[:projects].count).to eq(2)
        expect(result[:projects].pluck(:id)).to contain_exactly(@project1.id, @project2.id)
      end
    end

    context 'when specific publication statuses are requested' do
      it 'returns only published projects when no publication_statuses are specified exiplicitly' do
        result = query.run_query(
          start_at: nil,
          end_at: nil
        )

        expect(result[:projects].count).to eq(4)
        expect(result[:projects].pluck(:id)).to contain_exactly(@project1.id, @project2.id, @project3.id, @past_project.id)
      end

      it 'returns only published projects when only published is requested' do
        result = query.run_query(
          start_at: nil,
          end_at: nil,
          publication_statuses: %w[published]
        )

        expect(result[:projects].count).to eq(4)
        expect(result[:projects].pluck(:id)).to contain_exactly(@project1.id, @project2.id, @project3.id, @past_project.id)
      end

      it 'returns only archived projects when only archived is requested' do
        result = query.run_query(
          start_at: nil,
          end_at: nil,
          publication_statuses: %w[archived]
        )

        expect(result[:projects].count).to eq(1)
        expect(result[:projects].first[:id]).to eq(@project5.id)
      end

      it 'returns expected projects when two publication_statuses are requested' do
        result = query.run_query(
          start_at: nil,
          end_at: nil,
          publication_statuses: %w[published archived]
        )

        expect(result[:projects].count).to eq(5)
        expect(result[:projects].pluck(:id))
          .to contain_exactly(@project1.id, @project2.id, @project3.id, @project5.id, @past_project.id)
      end
    end

    context 'with exclusions' do
      let(:non_existent_project_id) { '00000000-0000-0000-0000-000000000000' }
      let(:non_existent_folder_id) { '11111111-1111-1111-1111-111111111111' }

      context 'by project IDs' do
        it 'excludes projects by their project IDs' do
          result = query.run_query(
            start_at: nil,
            end_at: nil,
            publication_statuses: %w[published],
            excluded_project_ids: [@project1.id]
          )

          expect(result[:projects].pluck(:id)).to contain_exactly(@project2.id, @project3.id, @past_project.id)
        end

        it 'returns all projects when excluded_project_ids is empty' do
          result = query.run_query(
            start_at: nil,
            end_at: nil,
            publication_statuses: %w[published],
            excluded_project_ids: []
          )

          expect(result[:projects].pluck(:id)).to contain_exactly(@project1.id, @project2.id, @project3.id, @past_project.id)
        end

        it 'handles non-existent project ID gracefully' do
          result = query.run_query(
            start_at: nil,
            end_at: nil,
            publication_statuses: %w[published],
            excluded_project_ids: [non_existent_project_id]
          )

          expect(result[:projects].count).to eq(4)
          expect(result[:projects].pluck(:id)).to contain_exactly(@project1.id, @project2.id, @project3.id, @past_project.id)
        end

        it 'handles mixed valid and non-existent project IDs' do
          result = query.run_query(
            start_at: nil,
            end_at: nil,
            publication_statuses: %w[published],
            excluded_project_ids: [@project1.id, non_existent_project_id]
          )

          expect(result[:projects].count).to eq(3)
          expect(result[:projects].pluck(:id)).not_to include(@project1.id)
          expect(result[:projects].pluck(:id)).to contain_exactly(@project2.id, @project3.id, @past_project.id)
        end

        it 'handles multiple project exclusions' do
          result = query.run_query(
            start_at: nil,
            end_at: nil,
            publication_statuses: %w[published],
            excluded_project_ids: [@project1.id, @project2.id]
          )

          expect(result[:projects].count).to eq(2)
          expect(result[:projects].pluck(:id)).not_to include(@project1.id, @project2.id)
          expect(result[:projects].pluck(:id)).to contain_exactly(@project3.id, @past_project.id)
        end
      end

      context 'by folder IDs' do
        before_all do
          @folder = create(:project_folder)
          @project_in_folder = create(:project, folder: @folder)
          create(:phase, project: @project_in_folder, start_at: Date.new(2022, 2, 1), end_at: nil)

          @folder2 = create(:project_folder)
          @project_in_folder2 = create(:project, folder: @folder2)
          create(:phase, project: @project_in_folder2, start_at: Date.new(2022, 2, 1), end_at: nil)
        end

        it 'excludes projects within excluded folders' do
          result = query.run_query(
            start_at: nil,
            end_at: nil,
            publication_statuses: %w[published],
            excluded_folder_ids: [@folder.id]
          )

          expect(result[:projects].pluck(:id)).to contain_exactly(@project_in_folder2.id, @project1.id, @project2.id, @project3.id, @past_project.id)
        end

        it 'returns all projects when excluded_folder_ids is empty' do
          result = query.run_query(
            start_at: nil,
            end_at: nil,
            publication_statuses: %w[published],
            excluded_folder_ids: []
          )

          expect(result[:projects].pluck(:id)).to contain_exactly(@project_in_folder.id, @project_in_folder2.id, @project1.id, @project2.id, @project3.id, @past_project.id)
        end

        it 'handles non-existent folder ID gracefully' do
          result = query.run_query(
            start_at: nil,
            end_at: nil,
            publication_statuses: %w[published],
            excluded_folder_ids: [non_existent_folder_id]
          )

          expect(result[:projects].count).to eq(6)
          expect(result[:projects].pluck(:id)).to contain_exactly(@project_in_folder.id, @project_in_folder2.id, @project1.id, @project2.id, @project3.id, @past_project.id)
        end

        it 'handles mixed valid and non-existent folder IDs' do
          result = query.run_query(
            start_at: nil,
            end_at: nil,
            publication_statuses: %w[published],
            excluded_folder_ids: [@folder.id, non_existent_folder_id]
          )

          expect(result[:projects].count).to eq(5)
          expect(result[:projects].pluck(:id)).not_to include(@project_in_folder.id)
          expect(result[:projects].pluck(:id)).to contain_exactly(@project_in_folder2.id, @project1.id, @project2.id, @project3.id, @past_project.id)
        end

        it 'handles multiple folder exclusions' do
          result = query.run_query(
            start_at: nil,
            end_at: nil,
            publication_statuses: %w[published],
            excluded_folder_ids: [@folder.id, @folder2.id]
          )

          expect(result[:projects].count).to eq(4)
          expect(result[:projects].pluck(:id)).not_to include(@project_in_folder.id, @project_in_folder2.id)
          expect(result[:projects].pluck(:id)).to contain_exactly(@project1.id, @project2.id, @project3.id, @past_project.id)
        end
      end

      context 'by both project and folder IDs' do
        before_all do
          @folder = create(:project_folder)
          @project_in_folder = create(:project, folder: @folder)
          create(:phase, project: @project_in_folder, start_at: Date.new(2022, 2, 1), end_at: nil)

          @folder2 = create(:project_folder)
          @project_in_folder2 = create(:project, folder: @folder2)
          create(:phase, project: @project_in_folder2, start_at: Date.new(2022, 2, 1), end_at: nil)
        end

        it 'excludes both projects by ID and projects in folders' do
          result = query.run_query(
            start_at: nil,
            end_at: nil,
            publication_statuses: %w[published],
            excluded_project_ids: [@project1.id],
            excluded_folder_ids: [@folder.id]
          )

          expect(result[:projects].count).to eq(4)
          expect(result[:projects].pluck(:id)).not_to include(@project1.id, @project_in_folder.id)
          expect(result[:projects].pluck(:id)).to contain_exactly(@project2.id, @project3.id, @project_in_folder2.id, @past_project.id)
        end

        it 'handles redundant exclusion of project and its folder' do
          result = query.run_query(
            start_at: nil,
            end_at: nil,
            publication_statuses: %w[published],
            excluded_project_ids: [@project_in_folder.id],
            excluded_folder_ids: [@folder.id]
          )

          expect(result[:projects].count).to eq(5)
          expect(result[:projects].pluck(:id)).not_to include(@project_in_folder.id)
          expect(result[:projects].pluck(:id)).to contain_exactly(@project1.id, @project2.id, @project3.id, @project_in_folder2.id, @past_project.id)
        end

        it 'handles multiple projects and multiple folders exclusions simultaneously' do
          result = query.run_query(
            start_at: nil,
            end_at: nil,
            publication_statuses: %w[published],
            excluded_project_ids: [@project1.id, @project2.id],
            excluded_folder_ids: [@folder.id, @folder2.id]
          )

          expect(result[:projects].count).to eq(2)
          expect(result[:projects].pluck(:id)).not_to include(
            @project1.id,
            @project2.id,
            @project_in_folder.id,
            @project_in_folder2.id
          )
          expect(result[:projects].pluck(:id)).to contain_exactly(@project3.id, @past_project.id)
        end

        it 'handles combined exclusions with non-existent IDs' do
          result = query.run_query(
            start_at: nil,
            end_at: nil,
            publication_statuses: %w[published],
            excluded_project_ids: [@project1.id, non_existent_project_id],
            excluded_folder_ids: [@folder.id, non_existent_folder_id]
          )

          expect(result[:projects].count).to eq(4)
          expect(result[:projects].pluck(:id)).not_to include(@project1.id, @project_in_folder.id)
          expect(result[:projects].pluck(:id)).to contain_exactly(@project2.id, @project3.id, @project_in_folder2.id, @past_project.id)
        end
      end
    end
  end
end
