# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Project, type: :model do
  describe 'visible_to' do
    it "gets set to 'public' when not specified on create" do
      project = create(:project, visible_to: nil)
      expect(project.visible_to).to eq 'public'
    end
  end
end
