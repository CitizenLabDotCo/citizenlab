# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Insights::WebApi::V1::TextNetworkAnalysisTaskViewSerializer do
  describe '#serializable_hash' do
    subject(:serializer) { described_class.new(task_view) }

    let(:task_view) { create(:tna_task_view) }

    it do
      expect(serializer.serializable_hash).to match(
        {
          data: {
            id: task_view.id,
            type: :text_network_analysis_task,
            attributes: {
              language: task_view.language,
              created_at: task_view.created_at
            }
          }
        }
      )
    end
  end
end
