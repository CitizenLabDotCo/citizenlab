# frozen_string_literal: true

require 'rails_helper'

describe McpServer::Tools::SetReferenceDistribution do
  let(:current_user) { create(:super_admin) }

  def submit(params)
    run_mcp_tool(described_class, params:, current_user:)
  end

  def distribution_for(field)
    UserCustomFields::Representativeness::RefDistribution.find_by(custom_field_id: field.id)
  end

  it 'sets a categorical distribution for a select field, keyed by option id' do
    field = create(:custom_field_gender, :with_options)

    response = submit(custom_field_id: field.id, counts_by_option: { 'female' => 51, 'male' => 48, 'unspecified' => 1 })

    expect(response).not_to be_error
    dist = distribution_for(field)
    expect(dist).to be_a(UserCustomFields::Representativeness::CategoricalDistribution)
    expect(dist.distribution[field.options.find_by(key: 'female').id]).to eq(51)
  end

  it 'sets a binned distribution for birthyear' do
    field = create(:custom_field_birthyear)

    response = submit(custom_field_id: field.id, bins: [nil, 1960, 1980, 2000, nil], counts: [10, 20, 30, 40])

    expect(response).not_to be_error
    dist = distribution_for(field)
    expect(dist).to be_a(UserCustomFields::Representativeness::BinnedDistribution)
    expect(dist.distribution['counts']).to eq([10, 20, 30, 40])
  end

  it 'replaces an existing distribution for the field' do
    field = create(:custom_field_gender, :with_options)
    submit(custom_field_id: field.id, counts_by_option: { 'female' => 1, 'male' => 1 })
    submit(custom_field_id: field.id, counts_by_option: { 'female' => 60, 'male' => 40 })

    expect(UserCustomFields::Representativeness::RefDistribution.where(custom_field_id: field.id).count).to eq(1)
    expect(distribution_for(field).distribution[field.options.find_by(key: 'female').id]).to eq(60)
  end

  it 'refuses an unknown option key and lists the available keys' do
    field = create(:custom_field_gender, :with_options)

    response = submit(custom_field_id: field.id, counts_by_option: { 'nonbinary' => 50, 'male' => 50 })

    expect(response).to be_error
    expect(response.content.first[:text]).to include('Unknown option keys: nonbinary', 'male')
    expect(distribution_for(field)).to be_nil
  end

  it 'refuses an unsupported field type' do
    field = create(:custom_field, input_type: 'text')

    response = submit(custom_field_id: field.id, counts_by_option: { 'a' => 1, 'b' => 1 })

    expect(response).to be_error
    expect(response.content.first[:text]).to include('only for select fields and birthyear')
  end

  it 'returns not found for an unknown field' do
    response = submit(custom_field_id: 'unknown', counts_by_option: { 'a' => 1, 'b' => 1 })

    expect(response).to be_error
    expect(response.content.first[:text]).to include('not found')
  end

  it 'refuses non-admin users' do
    field = create(:custom_field_gender, :with_options)

    response = run_mcp_tool(
      described_class,
      params: { custom_field_id: field.id, counts_by_option: { 'female' => 1, 'male' => 1 } },
      current_user: create(:user)
    )

    expect(response).to be_error
    expect(UserCustomFields::Representativeness::RefDistribution.count).to eq(0)
  end
end
