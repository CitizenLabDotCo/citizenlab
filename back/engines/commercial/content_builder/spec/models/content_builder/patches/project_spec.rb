# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ContentBuilder::Patches::Project, type: :model do
  subject(:project) { layout.content_buildable }

  let(:layout) { create(:layout) }
  let! :another_layout do
    create(
      :layout,
      content_buildable: project,
      code: 'another_layout',
      enabled: false
    )
  end

  describe '#content_builder_layouts' do
    it 'returns the layouts of a project' do
      expect(project.content_builder_layouts).to match_array([layout, another_layout])
    end
  end

  describe '#destroy' do
    it 'destroys its layouts' do
      expect { project.destroy }.to change { ContentBuilder::Layout.count }.by(-2)
    end
  end
end
