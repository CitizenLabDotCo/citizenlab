# frozen_string_literal: true

require 'rails_helper'

describe SideFxCustomFieldService do
  let(:service) { described_class.new }
  let(:user) { build(:user) }

  describe 'before_delete' do
    let_it_be(:custom_field1) { create(:custom_field) }
    let_it_be(:custom_field2) { create(:custom_field) }
    let_it_be(:custom_field3) { create(:custom_field) }
    let_it_be(:custom_field4) { create(:custom_field) }
    let_it_be(:analysis) { create(:analysis, main_custom_field: nil, additional_custom_fields: [custom_field1, custom_field2]) }
    let_it_be(:insight1) { create(:insight, analysis: analysis, filters: { "author_custom_#{custom_field1.id}" => [], 'votes_from' => 4 }, custom_field_ids: { main_custom_field_id: custom_field3.id, additional_custom_field_ids: [] }) }
    let_it_be(:insight2) { create(:insight, analysis: analysis, filters: { "author_custom_#{custom_field1.id}_from" => 5, "author_custom_#{custom_field2.id}_from" => 5 }, custom_field_ids: { main_custom_field_id: custom_field4.id, additional_custom_field_ids: [custom_field3.id] }) }
    let_it_be(:insight3) { create(:insight, analysis: analysis, filters: {}, custom_field_ids: { main_custom_field_id: custom_field3.id, additional_custom_field_ids: [custom_field4.id] }) }
    let_it_be(:auto_tagging_task) { create(:auto_tagging_task, analysis: analysis, filters: { "input_custom_#{custom_field2.id}" => [] }) }

    describe do
      let_it_be(:analysis) { create(:analysis, main_custom_field: custom_field1, additional_custom_fields: [custom_field2]) }

      it 'deletes the analysis with the field as main field', document: false do
        service.before_destroy(custom_field1, user)

        expect { Analysis::Analysis.find(analysis.id) }.to raise_error(ActiveRecord::RecordNotFound)
      end
    end

    it 'deletes the analysis with the field as additional field if there are no other fields' do
      analysis_with_multilple_additional_fields = analysis
      analysis_with_main_field = create(:analysis, main_custom_field: custom_field2, additional_custom_fields: [custom_field1])
      analysis_with_one_field = create(:analysis, main_custom_field: nil, additional_custom_fields: [custom_field1])

      service.before_destroy(custom_field1, user)

      expect { Analysis::Analysis.find(analysis_with_multilple_additional_fields.id) }.not_to raise_error(ActiveRecord::RecordNotFound)
      expect { Analysis::Analysis.find(analysis_with_main_field.id) }.not_to raise_error(ActiveRecord::RecordNotFound)
      expect { Analysis::Analysis.find(analysis_with_one_field.id) }.to raise_error(ActiveRecord::RecordNotFound)
    end

    it 'deletes the insights with the field as main or additional field' do
      service.before_destroy(custom_field4, user)

      expect { Analysis::Insight.find(insight1.id) }.not_to raise_error(ActiveRecord::RecordNotFound)
      expect { Analysis::Insight.find(insight2.id) }.to raise_error(ActiveRecord::RecordNotFound)
      expect { Analysis::Insight.find(insight3.id) }.to raise_error(ActiveRecord::RecordNotFound)
    end

    it 'deletes the custom field reference from the insight filters', document: false do
      service.before_destroy(custom_field1, user)

      expect(insight1.reload.filters).to eq({ 'votes_from' => 4 })
      expect(insight2.reload.filters).to eq({ "author_custom_#{custom_field2.id}_from" => 5 })
      expect(insight3.reload.filters).to eq({})
    end

    it 'deletes the custom field reference from the auto_tagging_task filters', document: false do
      service.before_destroy(custom_field2, user)

      expect(auto_tagging_task.reload.filters).to eq({})
    end
  end
end
