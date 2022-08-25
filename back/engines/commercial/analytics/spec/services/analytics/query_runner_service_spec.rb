# frozen_string_literal: true

require 'rails_helper'
require 'query'

describe Analytics::QueryRunnerService do
  describe 'run' do
    it 'return a list of posts IDs when i ask for id field' do
      ideas = create_list(:idea, 5) # Create 5 ideas
      create(:dimension_type) # Create the 'idea' type

      query_param = ActionController::Parameters.new({ fact: 'post', fields: 'id' })
      query = Analytics::Query.new(query_param)

      runner = described_class.new
      results = runner.run(query)
      expect(results).to match_array ideas.map({ |idea| {'id' => idea.id} })
    end
  end
end
