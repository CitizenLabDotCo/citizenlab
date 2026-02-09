# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ReportBuilder::Queries::MethodsUsed do
  subject(:query) { described_class.new(build(:user)) }

  describe '#run_query' do
    before_all do
      project = create(:project)

      # No overlap
      create(
        :information_phase,
        project: project,
        start_at: Date.new(2021, 1, 1),
        end_at: Date.new(2021, 2, 10)
      )

      # Overlap
      create(
        :information_phase,
        project: project,
        start_at: Date.new(2021, 2, 11),
        end_at: Date.new(2021, 3, 10)
      )
      create(
        :phase, # Ideation
        project: project,
        start_at: Date.new(2021, 3, 11),
        end_at: Date.new(2021, 4, 10)
      )
      create(
        :volunteering_phase,
        project: project,
        start_at: Date.new(2021, 4, 11),
        end_at: Date.new(2021, 5, 10)
      )

      # No overlap
      create(
        :volunteering_phase,
        project: project,
        start_at: Date.new(2021, 5, 11),
        end_at: Date.new(2021, 6, 10)
      )

      project2 = create(:project)
      create(
        :single_voting_phase,
        project: project2,
        start_at: Date.new(2021, 3, 11),
        end_at: nil
      )

      # Overlap, but project is in draft
      project3 = create(:project, admin_publication: create(:admin_publication, publication_status: 'draft'))
      create(
        :information_phase,
        project: project3,
        start_at: Date.new(2021, 2, 11),
        end_at: Date.new(2021, 3, 10)
      )

      # Make TimeBoundariesParser work as expected
      AppConfiguration.instance.update!(
        created_at: Date.new(2020, 12, 31),
        platform_start_at: Date.new(2020, 12, 31)
      )
    end

    context 'when start_at and end_at are provided' do
      it 'correctly filters phases' do
        start_at = Date.new(2021, 2, 13)
        end_at = Date.new(2021, 5, 1)

        result = query.run_query(start_at: start_at, end_at: end_at)

        expect(result[:count_per_method]).to eq({
          'information' => 1,
          'ideation' => 1,
          'volunteering' => 1,
          'voting' => 1
        })
      end
    end
  end
end
