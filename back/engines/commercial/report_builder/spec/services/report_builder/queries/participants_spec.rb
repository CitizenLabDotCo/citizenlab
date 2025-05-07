# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ReportBuilder::Queries::Participants do
  subject(:query) { described_class.new(build(:user)) }

  describe '#run_query' do
    before do
      # Make TimeBoundariesParser work as expected
      AppConfiguration.instance.update!(created_at: Date.new(2021, 1, 1))

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
        start_at: @date_september - 1.day,
        end_at: @date_september + 1.day
      }

      expect(query.run_query(**params)).to eq({
        participants_timeseries: [{
          participants: 1,
          date_group: Date.new(2022, 9, 1)
        }],
        participants_whole_period: 1,
        participation_rate_whole_period: 0
      })
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

      params = { start_at: @date_september - 1.day, end_at: @date_october + 1.day }
      expect(query.run_query(**params)).to eq({
        participants_timeseries: [
          {
            participants: 8,
            date_group: Date.new(2022, 9, 1)
          },
          {
            participants: 2,
            date_group: Date.new(2022, 10, 1)
          }
        ],
        participants_whole_period: 8,
        participation_rate_whole_period: 0
      })
    end

    it 'returns participation rate' do
      user = create(:user)

      create(:session, created_at: @date_september, monthly_user_hash: 'hash_1')
      create(:session, created_at: @date_september, monthly_user_hash: 'hash_2')

      project = create(:single_phase_ideation_project)
      create(:idea, created_at: @date_september, project: project, author: user)

      params = {
        start_at: @date_september - 1.day,
        end_at: @date_september + 1.day
      }

      expect(query.run_query(**params)).to eq({
        participants_timeseries: [{
          participants: 1,
          date_group: Date.new(2022, 9, 1)
        }],
        participants_whole_period: 1,
        participation_rate_whole_period: 0.5
      })
    end

    it 'returns correct data with compared period' do
      project = create(:single_phase_ideation_project)
      pp1, pp2, pp3 = create_list(:user, 3)

      # Setup september data: 1 participant, 2 unique visitors
      create(:idea, created_at: @date_september, project: project, author: pp1)
      create(:session, created_at: @date_september, monthly_user_hash: 'september_visitor_1')
      create(:session, created_at: @date_september, monthly_user_hash: 'september_visitor_2')

      # Setup october data: 3 participants, 4 unique visitors
      create(:idea, created_at: @date_october, project: project, author: pp1)
      create(:idea, created_at: @date_october, project: project, author: pp2)
      create(:idea, created_at: @date_october, project: project, author: pp3)

      4.times do |i|
        create(:session, created_at: @date_october, monthly_user_hash: "october_visitor_#{i}")
      end

      params = {
        start_at: Date.new(2022, 10, 1),
        end_at: Date.new(2022, 10, 31),
        compare_start_at: Date.new(2022, 9, 1),
        compare_end_at: Date.new(2022, 9, 30)
      }

      expect(query.run_query(**params)).to eq({
        participants_timeseries: [{
          participants: 3,
          date_group: Date.new(2022, 10, 1)
        }],
        participants_whole_period: 3,
        participation_rate_whole_period: 0.75,
        participants_compared_period: 1,
        participation_rate_compared_period: 0.5
      })
    end

    it 'applies project_id filter' do
      project = create(:single_phase_ideation_project)
      another_project = create(:single_phase_ideation_project)

      # Create 4 participants and 8 visitors for project
      4.times do
        create(:idea, created_at: @date_september, project: project, author: create(:user))
      end

      8.times do |i|
        session = create(:session, created_at: @date_september, monthly_user_hash: "visitor_#{i}")
        create(:pageview, created_at: @date_september, session_id: session.id, project_id: project.id)
      end

      # Create 3 participants and 4 visitors for other project
      3.times do
        create(:idea, created_at: @date_september, project: another_project, author: create(:user))
      end

      4.times do |i|
        session = create(:session, created_at: @date_september, monthly_user_hash: "another_visitor_#{i}")
        create(:pageview, created_at: @date_september, session_id: session.id, project_id: another_project.id)
      end

      params = {
        start_at: @date_september - 1.day,
        end_at: @date_september + 1.day,
        project_id: project.id
      }

      expect(query.run_query(**params)).to eq({
        participants_timeseries: [{
          participants: 4,
          date_group: Date.new(2022, 9, 1)
        }],
        participants_whole_period: 4,
        participation_rate_whole_period: 0.5
      })
    end

    it 'applies exclude_roles filter' do
      project = create(:single_phase_ideation_project)

      # Create 4 participants and 8 visitors for project with user role
      4.times do
        create(:idea, created_at: @date_september, project: project, author: create(:user))
      end

      8.times do |i|
        session = create(
          :session,
          created_at:
          @date_september, monthly_user_hash: "visitor_#{i}"
        )
        create(:pageview, created_at: @date_september, session_id: session.id, project_id: project.id)
      end

      # Create 3 participants and 4 visitors with admin role
      3.times do
        create(:idea, created_at: @date_september, project: project, author: create(:admin))
      end

      4.times do |i|
        session = create(
          :session,
          created_at:
          @date_september,
          monthly_user_hash: "another_visitor_#{i}",
          highest_role: 'admin'
        )
        create(:pageview, created_at: @date_september, session_id: session.id, project_id: project.id)
      end

      params = {
        start_at: @date_september - 1.day,
        end_at: @date_september + 1.day,
        exclude_roles: 'exclude_admins_and_moderators'
      }

      expect(query.run_query(**params)).to eq({
        participants_timeseries: [{
          participants: 4,
          date_group: Date.new(2022, 9, 1)
        }],
        participants_whole_period: 4,
        participation_rate_whole_period: 0.5
      })
    end

    it 'handles cases where there is no data' do
      params = {
        start_at: Date.new(2025, 2, 1),
        end_at: Date.new(2025, 3, 1),
        compare_start_at: Date.new(2025, 1, 1),
        compare_end_at: Date.new(2025, 2, 1)
      }

      expect(query.run_query(**params)).to eq({
        participants_timeseries: [],
        participants_whole_period: 0,
        participation_rate_whole_period: 0,
        participants_compared_period: 0,
        participation_rate_compared_period: 0
      })
    end
  end
end
