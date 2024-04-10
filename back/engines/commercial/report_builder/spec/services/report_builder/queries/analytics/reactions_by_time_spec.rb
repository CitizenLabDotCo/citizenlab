# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ReportBuilder::Queries::Analytics::ReactionsByTime do
  subject(:query) { described_class.new(build(:user)) }

  describe '#run_query' do
    let_it_be(:project) { create(:project) }

    let_it_be(:date) { Date.new(2022, 9, 1) }
    let_it_be(:activity) do
      create(:dimension_date, date: date)
      create(
        :activity,
        project_id: project.id,
        acted_at: date,
        item_type: 'Reaction',
        action: 'idea_liked',
        payload: {
          reactable_type: 'Idea',
          reactable_id: SecureRandom.uuid
        }
      )
    end

    let_it_be(:idea) { create(:idea, project: project) }

    let_it_be(:date2) { Date.new(2022, 9, 5) }
    let_it_be(:activity) do
      create(:dimension_date, date: date2)
      create(
        :activity,
        project_id: project.id,
        acted_at: date2,
        item_type: 'Reaction',
        action: 'idea_disliked',
        payload: {
          reactable_type: 'Idea',
          reactable_id: idea.id
        }
      )
    end

    let_it_be(:user) { create(:user) }

    let_it_be(:date3) { Date.new(2022, 9, 8) }
    let_it_be(:activity) do
      create(:dimension_date, date: date3)
      create(
        :activity,
        project_id: project.id,
        acted_at: date3,
        item_type: 'Reaction',
        action: 'idea_disliked',
        payload: {
          reactable_type: 'Idea',
          reactable_id: idea.id
        },
        user_id: user.id
      )
    end
    let_it_be(:activity) do
      create(
        :activity,
        project_id: project.id,
        acted_at: date3,
        item_type: 'Reaction',
        action: 'idea_disliked',
        payload: {
          reactable_type: 'Idea',
          reactable_id: idea.id
        },
        user_id: user.id
      )
    end
    let_it_be(:activity) do
      create(
        :activity,
        project_id: project.id,
        acted_at: date3,
        item_type: 'Reaction',
        action: 'idea_liked',
        payload: {
          reactable_type: 'Idea',
          reactable_id: idea.id
        },
        user_id: user.id
      )
    end

    it 'returns reactions by time' do
      params = { start_at: date - 1.day, end_at: date + 1.day, project_id: project.id }
      expect(query.run_query(**params)).to eq(
        [
          [
            {
              'count_reaction_id' => 1,
              'dimension_date_created.month' => '2022-09',
              'first_dimension_date_created_date' => date
            }
          ],
          [],
          [{ 'count_reaction_id' => 1 }]
        ]
      )
    end

    it 'returns reactions by time with dislikes' do
      params = { start_at: date - 1.day, end_at: date + 5.days, project_id: project.id }
      expect(query.run_query(**params)).to eq(
        [
          [
            {
              'count_reaction_id' => 1,
              'dimension_date_created.month' => '2022-09',
              'first_dimension_date_created_date' => date
            }
          ],
          [
            {
              'count_reaction_id' => 1,
              'dimension_date_created.month' => '2022-09',
              'first_dimension_date_created_date' => date2
            }
          ],
          [{ 'count_reaction_id' => 2 }]
        ]
      )
    end

    it 'dedupes identical reactions by the same user on the same reactable' do
      params = { start_at: date - 1.day, end_at: date + 10.days, project_id: project.id }
      expect(query.run_query(**params)).to eq(
        [
          [
            {
              'count_reaction_id' => 2,
              'dimension_date_created.month' => '2022-09',
              'first_dimension_date_created_date' => date
            }
          ],
          [
            {
              'count_reaction_id' => 2,
              'dimension_date_created.month' => '2022-09',
              'first_dimension_date_created_date' => date2
            }
          ],
          [{ 'count_reaction_id' => 4 }]
        ]
      )
    end
  end
end
