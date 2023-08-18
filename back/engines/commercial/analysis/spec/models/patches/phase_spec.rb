# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Phase do
  subject { create(:phase) }

  describe 'Deleting a phase' do
    it 'deletes its analyses' do
      analysis = create(:survey_analysis)
      expect { analysis.phase.destroy }.to change(Analysis::Analysis, :count).from(1).to(0)
    end
  end
end
