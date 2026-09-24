# frozen_string_literal: true

require 'rails_helper'

describe McpServer::Tools::CreateArea do
  let(:current_user) { create(:super_admin) }

  def create_area(params)
    run_mcp_tool(described_class, params:, current_user:)
  end

  it 'creates an area' do
    response = create_area(
      title_multiloc: { 'en' => 'North District' },
      description_multiloc: { 'en' => '<p>The north of town.</p>' }
    )

    expect(response).not_to be_error
    area = Area.find(response.structured_content[:id])
    expect(area.title_multiloc).to eq('en' => 'North District')
    expect(area.description_multiloc).to eq('en' => '<p>The north of town.</p>')
  end

  it 'adds a matching option to the domicile registration field' do
    domicile = create(:custom_field_domicile)

    response = create_area(title_multiloc: { 'en' => 'North District' })

    expect(response).not_to be_error
    option = Area.find(response.structured_content[:id]).custom_field_option
    expect(option.custom_field).to eq(domicile)
    expect(option.title_multiloc).to eq('en' => 'North District')
  end

  it 'refuses a blank title' do
    response = nil
    expect { response = create_area(title_multiloc: {}) }.not_to change(Area, :count)
    expect(response).to be_error
  end

  it 'refuses non-admin users' do
    response = nil
    expect do
      response = run_mcp_tool(
        described_class,
        params: { title_multiloc: { 'en' => 'North District' } },
        current_user: create(:user)
      )
    end.not_to change(Area, :count)
    expect(response).to be_error
  end
end
