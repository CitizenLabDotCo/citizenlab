# frozen_string_literal: true

require 'rails_helper'
require 'query'

describe Analytics::QueryRunnerService do
  describe 'run' do
    it 'return the ID field for each post' do
      ideas = create_list(:idea, 5)
      create(:dimension_type_idea)
      query_param = ActionController::Parameters.new(fact: 'post', fields: 'id')
      query = Analytics::Query.new(query_param)

      runner = described_class.new
      results = runner.run(query)
      expect(results).to match_array(ideas.map { |idea| { 'id' => idea.id } })
    end

    it 'return groups with aggregations' do
      create_list(:idea, 5)
      create_list(:initiative, 5)
      create(:dimension_type_idea)
      create(:dimension_type_initiative)
      create_list(:vote, 10)

      query_param = ActionController::Parameters.new(
        fact: 'post',
        groups: 'type.name',
        aggregations: {
          votes_count: %w[sum max]
        }
      )
      query = Analytics::Query.new(query_param)

      runner = described_class.new
      results = runner.run(query)

      expected_result = [
        { 'type.name' => 'initiative', 'sum_votes_count' => 0, 'max_votes_count' => 0.0 },
        { 'type.name' => 'idea', 'sum_votes_count' => 10, 'max_votes_count' => 1 }
      ]
      expect(results).to eq expected_result
    end

    it 'return filtered ideas count' do
      create_list(:idea, 5)
      create_list(:initiative, 5)
      create(:dimension_type_idea)
      create(:dimension_type_initiative)

      query_param = ActionController::Parameters.new(
        fact: 'post',
        dimensions: {
          type: {
            name: 'idea'
          }
        },
        aggregations: {
          all: 'count'
        }
      )
      query = Analytics::Query.new(query_param)

      runner = described_class.new
      results = runner.run(query)
      expect(results).to eq([{ 'count' => 5 }])
    end
  end
end
