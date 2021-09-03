# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Insights::WebApi::V1::TextNetworkAnalysisTaskViewSerializer do
  describe '#serializable_hash' do
    subject { described_class.new(task_view).serializable_hash }

    let(:task_view) { create(:tna_task_view) }

    # rubocop:disable RSpec/ExampleLength
    it do
      is_expected.to match(
        {
          data: {
            id: task_view.id,
            type: :text_network_analysis_task,
            attributes: {
              language: task_view.language,
              created_at: task_view.created_at
            }
          }
        })
    end
    # rubocop:enable RSpec/ExampleLength
  end
end
