require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Representativeness reference distributions' do
  header 'Content-Type', 'application/json'
  before { admin_header_token }

  get 'web_api/v1/users/custom_fields/:custom_field_id/reference_distribution' do
    let!(:reference_distribution) { create(:ref_distribution) }
    let(:custom_field_id) { reference_distribution.custom_field.id }

    let(:expected_response) do
      {
        data: {
          id: reference_distribution.id,
          type: 'reference_distribution',
          attributes: {
            distribution: reference_distribution.normalized_distribution.symbolize_keys
          },
          relationships: {
            values: {
              data: reference_distribution.distribution.keys.map do |key|
                { type: 'custom_field_option', id: key }
              end
            }
          }
        }
      }
    end

    example_request 'Get the reference distribution associated to a custom field' do
      expect(status).to eq(200)
      expect(json_response_body).to match(expected_response)
    end

    example 'not found' do
      pending 'TODO: Implement'
      raise NotImplementedError
    end
  end

  post 'web_api/v1/users/custom_fields/:custom_field_id/reference_distribution' do
    parameter :distribution, 'The distribution as (unnormalized) counts', required: true

    let(:custom_field_id) { custom_field.id }
    let(:custom_field) do
      create(:custom_field_select, resource_type: 'User').tap do |cf|
        create_list(:custom_field_option, 2, custom_field: cf)
      end
    end

    let(:distribution) do
      custom_field.custom_field_option_ids.index_with {rand(100) }
    end

    example_request 'Create a reference distribution' do
      expect(status).to eq(201)

      ref_distribution = UserCustomFields::Representativeness::RefDistribution.find(response_data[:id])

      aggregate_failures do
        expect(ref_distribution.distribution).to eq(distribution)
        expect(ref_distribution.custom_field_id).to eq(custom_field_id)
        expect(response_body)
          .to eq(UserCustomFields::WebApi::V1::RefDistributionSerializer.new(ref_distribution).serialized_json)
      end
    end
  end
end
