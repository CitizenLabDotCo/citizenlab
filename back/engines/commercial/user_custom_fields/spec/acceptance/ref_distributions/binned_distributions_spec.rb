# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Binned reference distributions' do
  header 'Content-Type', 'application/json'

  it_behaves_like(
    'reference distribution API',
    :binned_distribution,
    UserCustomFields::WebApi::V1::BinnedDistributionSerializer
  )

  let_it_be(:birthyear_custom_field) { create(:custom_field_birthyear) }
  let(:custom_field_id) { birthyear_custom_field.id }

  post 'web_api/v1/users/custom_fields/:custom_field_id/reference_distribution' do
    parameter :distribution, <<~DESC, required: true
      The distribution as a list of bin boundaries and the number of people in each bin.
    DESC

    let(:distribution) { build(:binned_distribution).distribution }

    context 'when admin' do
      before { admin_header_token }

      example 'creates a reference distribution' do
        expect { do_request }.to enqueue_job(LogActivityJob)
        expect(status).to eq(201)

        ref_distribution = UserCustomFields::Representativeness::BinnedDistribution.find(response_data[:id])

        aggregate_failures do
          expect(ref_distribution.distribution).to eq(distribution)
          expect(ref_distribution.custom_field_id).to eq(custom_field_id)
          expect(JSON.parse(response_body)).to match(
            UserCustomFields::WebApi::V1::BinnedDistributionSerializer.new(ref_distribution).as_json
          )
        end
      end

      context 'when the distribution is invalid' do
        let(:distribution) do
          {
            'bins' => [18, 35, nil, 70, nil],
            'counts' => [1000, 2000, 2250, 500]
          }
        end

        example_request 'returns 422 (Unprocessable Entity)' do
          expect(status).to eq(422)
          expect(json_response_body).to include(:errors)
        end
      end

      context 'when the custom field already has a distribution' do
        let!(:previous_distribution) { create(:binned_distribution) }

        example_request 'replaces the existing distribution' do
          expect(status).to eq(201)

          ref_distribution = UserCustomFields::Representativeness::BinnedDistribution.find(response_data[:id])

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
