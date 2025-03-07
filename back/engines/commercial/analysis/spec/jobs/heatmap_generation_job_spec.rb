# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Analysis::HeatmapGenerationJob do
  describe '.perform_now' do
    it 'generates the heatmap' do
      analysis = create(:analysis)
      tags = create_list(:tag, 2, analysis:)
      custom_field = create(:custom_field_select, :with_options)
      user = create(:user, custom_field_values: { custom_field.key => custom_field.options.first.id })
      inputs = create_list(:idea, 2, project: analysis.project, author: user)
      create(:tagging, tag: tags[0], input: inputs[0])
      expect { described_class.perform_now(analysis) }.to change { analysis.heatmap_cells.count }.by(4)
    end
  end
end
