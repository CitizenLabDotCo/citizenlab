# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Analysis::Summary do
  subject { summary }

  let(:summary) { build(:summary) }

  describe 'Default factory' do
    it { is_expected.to be_valid }
  end

  describe 'missing_inputs_count' do
    subject { summary.missing_inputs_count }

    let(:project) { create(:project_with_active_ideation_phase) }
    let(:inputs) { create_list(:idea, 2, project: project) }
    let(:analysis) { create(:analysis, project: project) }
    let(:summary) { create(:summary, insight_attributes: { inputs_ids: inputs.map(&:id), analysis: analysis }) }

    context 'when the inputs didn\'t change' do
      it { is_expected.to eq 0 }
    end

    context 'when inputs were added' do
      before do
        inputs.first.destroy!
        create_list(:idea, 2, project: project)
      end

      it { is_expected.to eq 2 }
    end

    context 'when inputs were deleted' do
      before do
        inputs.first.destroy!
      end

      it { is_expected.to eq 0 }
    end
  end
end
