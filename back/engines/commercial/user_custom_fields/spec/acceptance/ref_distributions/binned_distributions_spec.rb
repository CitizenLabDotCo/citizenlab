# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Binned distributions (reference distributions for birth-year custom field)' do
  header 'Content-Type', 'application/json'

  before { admin_header_token }

  let_it_be(:birthyear_custom_field) { create(:custom_field_birthyear) }
  let(:custom_field_id) { birthyear_custom_field.id }

  post 'web_api/v1/users/custom_fields/:custom_field_id/reference_distribution' do
    parameter :distribution, <<~DESC, required: true
      The distribution as a list of bin boundaries and the number of people in each bin.
    DESC

    let(:distribution) do
      {
        'bins' => [18, 35, 50, 70, nil],
        'counts' => [1000, 2000, 2250, 500]
      }
    end

    example_request 'creates a reference distribution' do
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
  end
end
