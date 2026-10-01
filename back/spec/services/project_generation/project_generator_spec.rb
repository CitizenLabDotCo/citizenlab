# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ProjectGeneration::ProjectGenerator do
  subject(:generator) { described_class.new(project, user, 'en') }

  let(:project) { create(:project, :draft) }
  let(:user) { create(:admin) }
  let(:llm) { instance_double(Analysis::LLM::ClaudeSonnet46) }
  let(:levers) { { influence: 1, how_fixed: 0, reach: 2, format: 2, audience: 2 } }

  let(:plan) do
    {
      'archetype' => 'gather_input',
      'archetype_rationale' => 'Open brief, high influence.',
      'title' => 'Park redesign',
      'description_preview' => 'Help redesign the central park.',
      'page_blocks' => [],
      'phases' => [
        phase('Share ideas', 'ideation', duration_days: 500),
        phase('Your views', 'native_survey', duration_days: 1, survey: {
          'title' => 'Your views',
          'questions' => [question('select', 'Pick one', options: %w[A B])]
        })
      ],
      'events' => [{
        'title' => 'Workshop', 'description' => 'Join us', 'location' => 'Town hall',
        'day_offset' => 1000, 'duration_minutes' => 9999, 'online' => false
      }],
      'visibility' => 'public',
      'audience_index' => 2,
      'rubric' => rubric
    }
  end

  def phase(title, method, duration_days:, survey: { 'title' => '', 'questions' => [] })
    { 'title' => title, 'description' => 'A phase.', 'participation_method' => method, 'duration_days' => duration_days, 'survey' => survey }
  end

  def question(input_type, title, options: [], statements: [], scale_maximum: 0, scale_labels: [])
    {
      'input_type' => input_type, 'title' => title, 'description' => '', 'required' => false,
      'options' => options, 'statements' => statements, 'scale_maximum' => scale_maximum, 'scale_labels' => scale_labels
    }
  end

  def rubric
    { 'clear_ask' => 4, 'right_method' => 4, 'realistic_scope' => 3, 'closes_the_loop' => 3, 'justification' => 'Solid.' }
  end

  # Stubs an MCP tool class and returns the list of argument hashes it was called with.
  # The real tool is returned, so the real input_schema.validate_arguments still runs
  # (a check that the generator builds schema-valid tool arguments); only #call is
  # stubbed, to avoid writing to the database.
  def stub_tool(klass, structured: { id: SecureRandom.uuid })
    calls = []
    tool = klass.for(current_user: user, token_scopes: [])
    response = instance_double(MCP::Tool::Response, 'error?': false, structured_content: structured, content: [])
    allow(tool).to receive(:call) do |server_context:, **args|
      calls << args
      response
    end
    allow(klass).to receive(:for).and_return(tool)
    calls
  end

  before do
    allow(Analysis::LLM::ClaudeSonnet46).to receive(:new).and_return(llm)
    allow(llm).to receive(:chat).and_return(plan)
  end

  describe '#generate_and_persist' do
    it 'sends the brief, the levers and the response schema to the LLM' do
      stub_all_tools
      generator.generate_and_persist(prompt: 'Redesign the park', levers: levers)

      expect(llm).to have_received(:chat) do |message, response_schema:|
        text = message.inputs.first
        expect(text).to include('Redesign the park')
        expect(text).to include('format = 2')
        expect(response_schema).to eq(described_class::RESPONSE_SCHEMA)
      end
    end

    it 'creates the phases back to back, clamping their durations' do
      phase_calls = stub_all_tools
      generator.generate_and_persist(prompt: 'x', levers: levers)

      first, second = phase_calls
      today = Time.zone.today
      expect(first).to include(participation_method: 'ideation', start_at: today.iso8601, end_at: (today + 119.days).iso8601)
      second_start = today + 120.days
      expect(second).to include(participation_method: 'native_survey', start_at: second_start.iso8601, end_at: (second_start + 2.days).iso8601)
    end

    it 'gives a native_survey phase its required survey title and button' do
      phase_calls = stub_all_tools
      generator.generate_and_persist(prompt: 'x', levers: levers)

      expect(phase_calls.second).to include(:native_survey_title_multiloc, :native_survey_button_multiloc)
    end

    it 'replaces the survey fields of the native_survey phase' do
      stub_all_tools
      field_calls = stub_tool(McpServer::Tools::ReplaceFormFields)
      generator.generate_and_persist(prompt: 'x', levers: levers)

      fields = field_calls.sole[:fields]
      expect(fields.first).to include(input_type: 'page')
      expect(fields.last).to include(input_type: 'page', key: 'form_end')
    end

    it 'sets visibility and restricts access from the audience lever' do
      stub_all_tools
      project_calls = stub_tool(McpServer::Tools::UpdateProject)
      permission_calls = stub_tool(McpServer::Tools::UpdatePhasePermission)
      generator.generate_and_persist(prompt: 'x', levers: levers)

      expect(project_calls.sole).to include(visible_to: 'public')
      expect(permission_calls).to all(include(action: 'posting_idea', permitted_by: 'admins_moderators'))
    end

    it 'creates events with clamped offsets and durations' do
      stub_all_tools
      event_calls = stub_tool(McpServer::Tools::CreateEvent)
      generator.generate_and_persist(prompt: 'x', levers: levers)

      start = Time.zone.today.in_time_zone.change(hour: 18) + 365.days
      expect(event_calls.sole).to include(start_at: start.iso8601, end_at: (start + 480.minutes).iso8601)
    end

    it 'raises when the LLM response is not a JSON object' do
      allow(llm).to receive(:chat).and_return('Sorry, I cannot help with that.')

      expect { generator.generate_and_persist(prompt: 'x', levers: levers) }
        .to raise_error(described_class::InvalidOutputError)
    end

    it 'raises when no usable phase remains' do
      plan['phases'] = [phase('', 'ideation', duration_days: 10)]

      expect { generator.generate_and_persist(prompt: 'x', levers: levers) }
        .to raise_error(described_class::InvalidOutputError)
    end
  end

  describe 'survey field output' do
    it 'is valid input for the replace_form_fields tool' do
      survey = { 'title' => 'Your views', 'questions' => [
        question('select', 'Pick one', options: %w[A B]),
        question('linear_scale', 'How safe?', scale_maximum: 20, scale_labels: ['Low', '', 'High'])
      ] }
      fields = generator.send(:survey_fields, survey)
      tool = McpServer::Tools::ReplaceFormFields.for(current_user: nil, token_scopes: [])

      expect { tool.input_schema.validate_arguments(container_type: 'phase', container_id: project.id, fields: fields) }
        .not_to raise_error
      # out-of-range scale clamped to the allowed maximum
      linear_scale = fields.find { |field| field[:input_type] == 'linear_scale' }
      expect(linear_scale[:maximum]).to eq(CustomField::LINEAR_SCALE_MAX_RANGE.max)
    end

    it 'drops questions that cannot be built' do
      survey = { 'title' => 'x', 'questions' => [question('select', 'Only one', options: %w[A])] }
      expect(generator.send(:survey_fields, survey)).to be_nil
    end
  end

  def stub_all_tools
    phase_calls = stub_tool(McpServer::Tools::CreatePhase)
    stub_tool(McpServer::Tools::UpdateProjectLayout)
    stub_tool(McpServer::Tools::ReplaceFormFields)
    stub_tool(McpServer::Tools::CreateEvent)
    stub_tool(McpServer::Tools::UpdateProject)
    stub_tool(McpServer::Tools::UpdatePhasePermission)
    phase_calls
  end
end
