require 'rails_helper'

describe 'rake initiatives_to_proposals' do # rubocop:disable RSpec/DescribeClass
  before { load_rake_tasks_if_not_loaded }
  after { Rake::Task['initiatives_to_proposals:add_proposals_statuses'].reenable }

  describe 'add_proposals_statuses' do
    it 'Adds the default proposals statuses and reorders all statuses.' do
      create(:idea_status, code: 'implemented', ordering: 350)
      create(:idea_status, code: 'proposed', ordering: 100)
      create(:idea_status, code: 'rejected', ordering: 200)
      create(:proposals_status, code: 'proposed', ordering: 0, color: '#AABBCC')

      Rake::Task['initiatives_to_proposals:add_proposals_statuses'].invoke

      expected_attributeses = [
        {
          ordering: 0,
          participation_method: 'ideation',
          code: 'proposed'
        },
        {
          ordering: 1,
          participation_method: 'ideation',
          code: 'rejected'
        },
        {
          ordering: 2,
          participation_method: 'ideation',
          code: 'implemented'
        },
        {
          ordering: 0,
          participation_method: 'proposals',
          code: 'proposed',
          color: '#AABBCC'
        },
        {
          ordering: 1,
          participation_method: 'proposals',
          code: 'threshold_reached',
          color: '#40B8C5'
        },
        {
          ordering: 2,
          participation_method: 'proposals',
          code: 'expired',
          color: '#FF672F'
        },
        {
          ordering: 3,
          participation_method: 'proposals',
          code: 'answered',
          color: '#147985'
        },
        {
          ordering: 4,
          participation_method: 'proposals',
          code: 'ineligible',
          color: '#E52516'
        }
      ]
      expect(IdeaStatus.count).to eq(expected_attributeses.size)
      IdeaStatus.order(:ordering, :participation_method).zip(expected_attributeses).each do |idea_status, expected_attributes|
        expect(idea_status.attributes.symbolize_keys).to include(expected_attributes)
      end
    end
  end
end
