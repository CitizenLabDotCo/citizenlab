# frozen_string_literal: true

require 'rails_helper'

describe McpServer::Tools::UpdateArea do
  let(:current_user) { create(:super_admin) }
  let(:area) { create(:area) }

  before { change_lifecycle_stage('demo') }

  def run(params)
    run_mcp_tool(described_class, params:, current_user:)
  end

  describe '#input_schema' do
    it "reuses create_area's properties" do
      area_properties = McpServer::Tools::CreateArea.new.input_schema[:properties]
      schema = described_class.new.input_schema

      expect(schema[:properties].keys).to eq([:area_id, *area_properties.keys])
      expect(schema[:required]).to eq(%w[area_id])
      expect(schema[:additionalProperties]).to be(false)
    end
  end

  it 'updates only the given attributes and merges multiloc fields' do
    area.update!(title_multiloc: { 'en' => 'Old', 'fr-FR' => 'Ancien' })

    response = nil
    expect { response = run(area_id: area.id, title_multiloc: { 'en' => 'New' }) }
      .to not_change { area.reload.description_multiloc }

    expect(response).not_to be_error
    expect(area.reload.title_multiloc).to eq('en' => 'New', 'fr-FR' => 'Ancien')
    expect(response.structured_content).to include(
      id: area.id,
      title_multiloc: { 'en' => 'New', 'fr-FR' => 'Ancien' }
    )
  end

  it 'logs the area change' do
    expect { run(area_id: area.id, title_multiloc: { 'en' => 'New' }) }
      .to have_enqueued_job(LogActivityJob).at_least(:once)
  end

  it 'returns structured validation errors for an invalid update' do
    area.update!(title_multiloc: { 'en' => 'Old' })

    response = run(area_id: area.id, title_multiloc: { 'en' => '' })

    expect(response).to be_error
    expect(response.structured_content[:errors]).to be_present
  end

  it 'refuses outside demo and trial platforms' do
    change_lifecycle_stage('active')

    response = nil
    expect { response = run(area_id: area.id, title_multiloc: { 'en' => 'New' }) }
      .not_to change { area.reload.title_multiloc }

    expect(response).to be_error
    expect(response.content.sole[:text]).to include('demo and trial')
  end

  it 'refuses non-admin users' do
    response = run_mcp_tool(
      described_class,
      params: { area_id: area.id, title_multiloc: { 'en' => 'New' } },
      current_user: create(:user)
    )

    expect(response).to be_error
  end

  it 'returns a not-found error when the area is missing' do
    response = run(area_id: SecureRandom.uuid, title_multiloc: { 'en' => 'New' })

    expect(response).to be_not_found('Area')
  end
end
