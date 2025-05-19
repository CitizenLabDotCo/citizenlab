# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ReportBuilder::Queries::Projects do
  subject(:query) { described_class.new(build(:user)) }

  describe '#run_query' do
    before_all do
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
      @project1 = create(:project)
      create(:phase, project: @project1, start_at: Date.new(2021, 2, 1), end_at: Date.new(2021, 3, 1))

      @project2 = create(:project)
      create(:phase, project: @project2, start_at: Date.new(2021, 2, 1), end_at: Date.new(2021, 3, 1))
      create(:phase, project: @project2, start_at: Date.new(2021, 3, 2), end_at: nil)

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
      AppConfiguration.instance.update!(created_at: Date.new(2019, 12, 31))

      # Add project image
      create(:project_image, project: @project1)
    end

    it 'returns overlapping projects' do
      result = query.run_query(
        start_at: Date.new(2021, 1, 1),
        end_at: Date.new(2021, 4, 1),
        publication_statuses: %w[published]
      )

      expect(result[:projects].count).to eq(2)

      expect(
        result[:projects].pluck(:id).sort
      ).to eq([@project1.id, @project2.id].sort)
    end

    it 'returns overlapping projects when last phase has no end date' do
      result = query.run_query(
        start_at: Date.new(2022, 1, 1),
        end_at: Date.new(2022, 4, 1),
        publication_statuses: %w[published]
      )

      expect(result[:projects].count).to eq(2)

      expect(
        result[:projects].pluck(:id).sort
      ).to eq([@project2.id, @project3.id].sort)
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

    context 'when specific publication statuses are requested' do
      it 'returns only published projects when no publication_statuses are specified exiplicitly' do
        result = query.run_query(
          start_at: nil,
          end_at: nil
        )

        expect(result[:projects].count).to eq(4)
        expect(result[:projects].pluck(:id)).to match_array [@project1.id, @project2.id, @project3.id, @past_project.id]
      end

      it 'returns only published projects when only published is requested' do
        result = query.run_query(
          start_at: nil,
          end_at: nil,
          publication_statuses: %w[published]
        )

        expect(result[:projects].count).to eq(4)
        expect(result[:projects].pluck(:id)).to match_array [@project1.id, @project2.id, @project3.id, @past_project.id]
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
          .to match_array [@project1.id, @project2.id, @project3.id, @project5.id, @past_project.id]
      end
    end
  end
end
