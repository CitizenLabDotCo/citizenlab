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

  describe '#write_call_error' do
    def error_for(arguments)
      surface.write_call_error(surface.tool('update_resource'), nil, arguments)
    end

    it 'accepts a date with a time and without a time zone' do
      expect(error_for({ 'start_at' => '2026-11-02T00:00:00', 'end_at' => '2026-11-30T23:59:00' })).to be_nil
    end

    it 'lets the model remove an end date' do
      expect(error_for({ 'end_at' => nil })).to be_nil
    end

    it 'refuses any other date' do
      ['2026-11-30', '2026-11-30T23:59:00Z', '2026-13-01T00:00:00', '2026-1-2T03:04:05', 'next monday'].each do |date|
        expect(error_for({ 'end_at' => date })).to start_with('Write start_at and end_at'), date
      end
    end

    it 'checks the dates of an update to an event' do
      expect(error_for({ 'attributes' => { 'start_at' => 'next monday' } })).to start_with('Write start_at and end_at')
    end
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
