# frozen_string_literal: true

require 'rails_helper'

describe AIAssistant::Surfaces::ProjectGenerator do
  subject(:surface) { described_class.new(project) }

  let(:project) { create(:project, :draft) }
  let(:user) { create(:super_admin) }

  it 'is only available for draft projects' do
    expect(surface).to be_available
    expect(described_class.new(create(:project))).not_to be_available
  end

  it 'pins new phases and events to the project' do
    expect(surface.tool('create_phase').pinned).to eq('project_id' => project.id)
    expect(surface.tool('create_event').pinned).to eq('project_id' => project.id)
    expect(surface.tool('update_project').llm_schema['properties']).not_to include('project_id', 'remote_header_bg_url', 'folder_id')
  end

  it 'gives the model a tool to ask questions' do
    expect(surface.llm_tools(instance_double(AIAssistant::Turn)).map(&:name)).to include('ask_user')
  end

  describe 'records the model picks' do
    let(:phase) { create(:phase, project:) }
    let(:event) { create(:event, project:) }

    def outside?(tool_name, args)
      surface.tool(tool_name).validation_error(user, args) == AIAssistant::Tool::OUTSIDE_SUBJECT_TEXT
    end

    it 'only allows phases of the project' do
      other_phase = create(:phase)

      %w[list_phase_permissions update_phase update_phase_permission].each do |tool_name|
        expect(outside?(tool_name, { 'phase_id' => phase.id })).to be(false), tool_name
        expect(outside?(tool_name, { 'phase_id' => other_phase.id })).to be(true), tool_name
      end
    end

    it 'only allows events of the project to be updated' do
      expect(outside?('update_resource', { 'type' => 'event', 'id' => event.id })).to be(false)
      expect(outside?('update_resource', { 'type' => 'event', 'id' => create(:event).id })).to be(true)
      expect(outside?('update_resource', { 'type' => 'cause', 'id' => event.id })).to be(true)
    end

    it 'only lets the model read the project, its phases and its events' do
      expect(outside?('get_resource', { 'type' => 'project', 'id' => project.id })).to be(false)
      expect(outside?('get_resource', { 'type' => 'phase', 'id' => phase.id })).to be(false)
      expect(outside?('get_resource', { 'type' => 'event', 'id' => event.id })).to be(false)
      expect(outside?('get_resource', { 'type' => 'project', 'id' => create(:project).id })).to be(true)
      expect(outside?('get_resource', { 'type' => 'phase', 'id' => create(:phase).id })).to be(true)
      expect(outside?('get_resource', { 'type' => 'input', 'id' => create(:idea, project:).id })).to be(true)
    end

    it 'only allows phases and events of the project to be removed' do
      expect(outside?('destroy_resource', { 'resource_type' => 'phase', 'id' => phase.id })).to be(false)
      expect(outside?('destroy_resource', { 'resource_type' => 'event', 'id' => event.id })).to be(false)
      expect(outside?('destroy_resource', { 'resource_type' => 'project', 'id' => project.id })).to be(true)
    end
  end

  it 'describes the current draft in the system prompt' do
    phase = create(:phase, project:, title_multiloc: { 'en' => 'Map what should change' })

    prompt = surface.system_prompt(locale: 'en')

    expect(prompt).to include(project.title_multiloc['en'], 'Map what should change', phase.id, 'Today is ')
  end
end
