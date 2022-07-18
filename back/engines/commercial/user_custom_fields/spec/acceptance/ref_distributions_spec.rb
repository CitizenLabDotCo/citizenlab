# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Representativeness reference distributions' do
  header 'Content-Type', 'application/json'

  shared_examples 'unauthorized requests' do
    context 'when visitor' do
      example 'returns 401 (Unauthorized)', document: false do
        do_request
        expect(status).to eq(401)
      end
    end

    context 'when normal user' do
      before { user_header_token }

      example 'returns 401 (Unauthorized)', document: false do
        do_request
        expect(status).to eq(401)
      end
    end
  end

  get 'web_api/v1/users/custom_fields/:custom_field_id/reference_distribution' do
    let!(:reference_distribution) { create(:categorical_distribution) }
    let(:custom_field_id) { reference_distribution.custom_field.id }

    context 'when admin' do
      before { admin_header_token }

      context 'when the custom field has a reference distribution' do
        let(:expected_response) do
          {
            data: {
              id: reference_distribution.id,
              type: 'categorical_distribution',
              attributes: {
                distribution: reference_distribution.probabilities_and_counts.symbolize_keys
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
      end

      context 'when the custom field does not have a reference distribution' do
        before { reference_distribution.destroy! }

        example_request 'returns 404 (Not Found)' do
          expect(status).to eq(404)
        end
      end
    end

    include_examples 'unauthorized requests'
  end

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
      custom_field.option_ids.index_with { rand(100) }
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

    include_examples 'unauthorized requests'
  end

  delete 'web_api/v1/users/custom_fields/:custom_field_id/reference_distribution' do
    let!(:reference_distribution) { create(:categorical_distribution) }
    let(:custom_field_id) { reference_distribution.custom_field_id }

    context 'when admin' do
      before { admin_header_token }

      context 'when the custom field has a reference distribution' do
        example 'deletes the reference distribution' do
          expect { do_request }.to enqueue_job(LogActivityJob)
          expect(status).to eq(204)
          expect(UserCustomFields::Representativeness::RefDistribution.find_by(id: custom_field_id)).to be_nil
        end
      end

      context "when the custom field doesn't have a reference distribution" do
        before { reference_distribution.destroy! }

        example_request 'returns 404 (Not Found)' do
          expect(status).to eq(404)
        end
      end
    end

    include_examples 'unauthorized requests'
  end
end
