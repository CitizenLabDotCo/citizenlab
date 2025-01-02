# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ReportBuilder::Queries::Analytics::Participants do
  subject(:query) { described_class.new(build(:user)) }

  describe '#run_query' do
    before do
      FactoryBot.rewind_sequences
      @date_september = Date.new(2022, 9, 10)
      @date_october = Date.new(2022, 10, 5)

      @dimension_date_sept = create(:dimension_date, date: @date_september)
      @dimension_date_oct = create(:dimension_date, date: @date_october)
      Analytics::PopulateDimensionsService.populate_types
    end

    it 'returns participants' do
      project = create(:single_phase_ideation_project)
      create(:idea, created_at: @date_september, project: project)

      params = {
        start_at: (@date_september - 1.day).to_s,
        end_at: (@date_september + 1.day).to_s,
        project_id: project.id
      }
      expect(query.run_query(**params)).to eq(
        [
          [{
            'count_participant_id' => 1,
            'dimension_date_created.month' => '2022-09',
            'first_dimension_date_created_date' => @date_september
          }],
          [{
            'count_participant_id' => 1
          }],
          [],
          [{
            'count_participant_id' => 0
          }]
        ]
      )
    end

    it 'correctly deals with anonymous and deleted users' do
      project = create(:project)
      pp1, pp2, pp3, pp4 = create_list(:user, 4)

      ### SEPTEMBER ###
      # Create a bunch of ideas and comments with users (4 participants)
      idea1 = create(:idea, project: project, author: pp1, created_at: @date_september) # 1
      idea2 = create(:idea, project: project, author: pp2, created_at: @date_september) # 2
      create(:comment, idea: idea1, author: pp3, created_at: @date_september) # 3
      create(:idea, project: project, created_at: @date_september) # 4
      create(:comment, idea: idea2, author: pp1, created_at: @date_september)

      # Create two ideas and a comment, anonymous, but all for the same user (1 participant)
      idea3 = create(:idea, project: project, author: pp4, anonymous: true, created_at: @date_september)
      create(:idea, project: project, author: pp4, anonymous: true, created_at: @date_september)
      create(:comment, idea: idea3, author: pp4, anonymous: true, created_at: @date_september)

      # Create another anonymous idea for another user (1 participant)
      create(:idea, project: project, anonymous: true, created_at: @date_september)

      # Add two ideas, not anonymous but no user_id or author_hash (2 participants)
      create(:idea, project: project, anonymous: false, author: nil, created_at: @date_september)
      create(:idea, project: project, anonymous: false, author: nil, created_at: @date_september)

      ### OCTOBER ###
      # Create two ideas (2 participants)
      create(:idea, project: project, author: pp1, created_at: @date_october) # 1
      create(:idea, project: project, author: pp2, created_at: @date_october) # 2

      params = { start_at: @date_september - 1.day, end_at: @date_october + 1.day, project_id: project.id }
      expect(query.run_query(**params)).to eq(
        [
          [
            {
              'count_participant_id' => 8,
              'dimension_date_created.month' => '2022-09',
              'first_dimension_date_created_date' => @date_september
            },
            {
              'count_participant_id' => 2,
              'dimension_date_created.month' => '2022-10',
              'first_dimension_date_created_date' => @date_october
            }
          ],
          [{
            'count_participant_id' => 8
          }],
          [],
          [{
            'count_participant_id' => 0
          }]
        ]
      )
    end

    it 'returns participants in compared period' do
      project = create(:project)
      pp1, pp2, pp3, pp4 = create_list(:user, 4)

      ### SEPTEMBER ###
      create(:idea, project: project, author: pp1, created_at: @date_september)
      create(:idea, project: project, author: pp2, created_at: @date_september)

      ### OCTOBER ###
      create(:idea, project: project, author: pp1, created_at: @date_october)
      create(:idea, project: project, author: pp3, created_at: @date_october)
      create(:idea, project: project, author: pp4, created_at: @date_october)

      params = {
        start_at: Date.new(2022, 10, 1).to_s,
        end_at: Date.new(2022, 10, 31).to_s,
        project_id: project.id,
        compare_start_at: Date.new(2022, 8, 31).to_s,
        compare_end_at: Date.new(2022, 9, 30).to_s
      }

      expect(query.run_query(**params)).to eq(
        [
          [
            {
              'count_participant_id' => 3,
              'dimension_date_created.month' => '2022-10',
              'first_dimension_date_created_date' => @date_october
            }
          ],
          [{
            'count_participant_id' => 3
          }],
          [],
          [{
            'count_participant_id' => 0
          }],
          [{
            'count_participant_id' => 2
          }],
          [],
          [{
            'count_participant_id' => 0
          }]
        ]
      )
    end

    it 'returns visitors and a separate count for participants filtered by has_visits' do
      user = create(:user)

      create(:fact_visit, dimension_date_first_action: @dimension_date_sept, dimension_user_id: user.id)
      create(:fact_visit, dimension_date_first_action: @dimension_date_sept)

      project = create(:single_phase_ideation_project)
      create(:idea, created_at: @date_september, project: project)
      create(:idea, created_at: @date_september, project: project, author: user)

      params = {
        start_at: (@date_september - 1.day).to_s,
        end_at: (@date_september + 1.day).to_s
      }
      expect(query.run_query(**params)).to eq(
        [
          [{
            'count_participant_id' => 2,
            'dimension_date_created.month' => '2022-09',
            'first_dimension_date_created_date' => @date_september
          }],
          [{
            'count_participant_id' => 2
          }],
          [{
            'count_visitor_id' => 2
          }],
          [{
            'count_participant_id' => 1
          }]
        ]
      )
    end

    it 'returns visitors and a separate count for participants filtered by has_visits in compared period' do
      user1 = create(:user)
      user2 = create(:user)

      project = create(:single_phase_ideation_project)

      ### SEPTEMBER ###
      create(:fact_visit, dimension_date_first_action: @dimension_date_sept, dimension_user_id: user1.id)
      create(:fact_visit, dimension_date_first_action: @dimension_date_sept)
      create(:fact_visit, dimension_date_first_action: @dimension_date_sept)
      create(:fact_visit, dimension_date_first_action: @dimension_date_sept)

      create(:idea, created_at: @date_september, project: project, author: user1)
      create(:idea, created_at: @date_september, project: project)

      ### OCTOBER ###
      create(:fact_visit, dimension_date_first_action: @dimension_date_oct, dimension_user_id: user1.id)
      create(:fact_visit, dimension_date_first_action: @dimension_date_oct, dimension_user_id: user2.id)
      create(:fact_visit, dimension_date_first_action: @dimension_date_oct)
      create(:fact_visit, dimension_date_first_action: @dimension_date_oct)

      create(:idea, created_at: @date_october, project: project, author: user1)
      create(:idea, created_at: @date_october, project: project, author: user2)
      create(:idea, created_at: @date_october, project: project)
      create(:idea, created_at: @date_october, project: project)

      params = {
        start_at: Date.new(2022, 10, 1).to_s,
        end_at: Date.new(2022, 10, 30).to_s,
        compare_start_at: Date.new(2022, 9, 1).to_s,
        compare_end_at: Date.new(2022, 9, 30).to_s
      }

      expect(query.run_query(**params)).to eq(
        [
          [
            {
              'count_participant_id' => 4,
              'dimension_date_created.month' => '2022-10',
              'first_dimension_date_created_date' => @date_october
            }
          ],
          [{
            'count_participant_id' => 4
          }],
          [{
            'count_visitor_id' => 4
          }],
          [{
            'count_participant_id' => 2
          }],
          [{
            'count_participant_id' => 2
          }],
          [{
            'count_visitor_id' => 4
          }],
          [{
            'count_participant_id' => 1
          }]
        ]
      )
    end
  end
end
