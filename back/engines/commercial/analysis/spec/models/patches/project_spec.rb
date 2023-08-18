# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Phase do
  describe 'Deleting a project' do
    it 'deletes its analyses' do
      analysis = create(:analysis)
      expect { analysis.project.destroy }.to change(Analysis::Analysis, :count).from(1).to(0)
    end
  end
end
