# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Categorical reference distributions' do
  header 'Content-Type', 'application/json'

  it_behaves_like(
    'reference distribution API',
    :categorical_distribution,
    UserCustomFields::WebApi::V1::CategoricalDistributionSerializer
  )

  post 'web_api/v1/users/custom_fields/:custom_field_id/reference_distribution' do
    parameter :distribution, <<~DESC, required: true
      The distribution as population counts for each custom field option.
    DESC

    let(:custom_field_id) { custom_field.id }
    let(:custom_field) do
      create(:custom_field_select, resource_type: 'User').tap do |custom_field|
        create_list(:custom_field_option, 2, custom_field: custom_field)
      end
    end

    let(:distribution) do
      custom_field.option_ids.index_with { rand(1..100) }
    end

    context 'when admin' do
      before { admin_header_token }

      example 'creates a reference distribution' do
        expect { do_request }.to enqueue_job(LogActivityJob)
        expect(status).to eq(201)

        ref_distribution = UserCustomFields::Representativeness::CategoricalDistribution.find(response_data[:id])

        aggregate_failures do
          expect(ref_distribution.distribution).to eq(distribution)
          expect(ref_distribution.custom_field_id).to eq(custom_field_id)
          expect(JSON.parse(response_body)).to match(
            UserCustomFields::WebApi::V1::CategoricalDistributionSerializer.new(ref_distribution).as_json
          )
        end
      end

      context 'when the distribution is invalid' do
        let(:distribution) { { 'bad-option' => 22 } }

        example_request 'returns 422 (Unprocessable Entity)' do
          expect(status).to eq(422)
          expect(json_response_body).to include(:errors)
        end
      end

      context 'when the custom field already has a distribution' do
        let!(:previous_distribution) { create(:categorical_distribution, custom_field: custom_field) }

        example_request 'replaces the existing distribution' do
          expect(status).to eq(201)

          ref_distribution = UserCustomFields::Representativeness::RefDistribution.find(response_data[:id])

          aggregate_failures do
            expect(ref_distribution.custom_field_id).to eq(custom_field_id)
            expect(previous_distribution.id).not_to eq(ref_distribution.id)
            expect { previous_distribution.reload }.to raise_error(ActiveRecord::RecordNotFound)
          end
        end
      end
    end

    include_examples 'not authorized to visitors'
    include_examples 'not authorized to normal users'
  end
end
