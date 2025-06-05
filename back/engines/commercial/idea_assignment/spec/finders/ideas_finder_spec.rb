# frozen_string_literal: true

require 'rails_helper'

describe IdeasFinder do
  subject(:result) { described_class.new(params, **options) }

  let(:options) { {} }
  let(:result_record_ids) { result.find_records.pluck(:id) }
  let(:assignee) { create(:admin) }
  let!(:unassigned_ideas) { create_list(:idea, 2) }
  let!(:assigned_ideas) { create_list(:idea, 3, assignee: assignee) }

  describe '#assignee_condition' do
    describe 'filtering on an assignee ID' do
      let(:params) { { assignee: assignee.id } }

      it 'returns the correct records' do
        expect(result_record_ids).to match_array assigned_ideas.map(&:id)
      end
    end

    describe 'filtering on unassigned' do
      let(:params) { { assignee: 'unassigned' } }

      it 'returns the correct records' do
        expect(result_record_ids).to match_array unassigned_ideas.map(&:id)
      end
    end
  end

  describe 'base filtering' do
    let(:params) { {} }

    before do
      @idea_without_content = create(:idea)
      @idea_without_content.update_columns(
        title_multiloc: {}, 
        body_multiloc: {}
      )
    end

    # Note: If a phase is changed from native survey to ideation,
    # this can mean that ideas with no displayable content exist for the phase.
    it 'does not return ideas with no content' do
      expect(result_record_ids).to match_array (unassigned_ideas + assigned_ideas).map(&:id)
      expect(result_record_ids).not_to include @idea_without_content.id
    end

    it 'only returns publicly visible ideas' do
      project = create(:project, phases: [create(:active_native_survey_phase)])
      _status = create(:idea_status_proposed)
      response = create(:native_survey_response, project: project)

      expect(result_record_ids).to match_array (unassigned_ideas + assigned_ideas).map(&:id)
      expect(result_record_ids).not_to include response.id
    end
  end
end
