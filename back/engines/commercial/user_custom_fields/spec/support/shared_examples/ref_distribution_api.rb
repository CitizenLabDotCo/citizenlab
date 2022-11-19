# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

# rubocop:disable RSpec/EmptyExampleGroup
RSpec.shared_examples 'reference distribution API' do |factory_name, serializer_class|
  get 'web_api/v1/users/custom_fields/:custom_field_id/reference_distribution' do
    let!(:reference_distribution) { create(factory_name) }
    let(:custom_field_id) { reference_distribution.custom_field.id }

    context 'when admin' do
      before { admin_header_token }

      context 'when the custom field has a reference distribution' do
        example_request 'Get the reference distribution associated to a custom field' do
          expect(status).to eq(200)
          expect(JSON.parse(response_body))
            .to eq(serializer_class.new(reference_distribution).as_json)
        end
      end

      context 'when the custom field does not have a reference distribution' do
        before { reference_distribution.destroy! }

        example_request 'returns 404 (Not Found)' do
          expect(status).to eq(404)
        end
      end
    end

    include_examples 'not authorized to visitors'
    include_examples 'not authorized to normal users'
  end

  delete 'web_api/v1/users/custom_fields/:custom_field_id/reference_distribution' do
    let!(:reference_distribution) { create(factory_name) }
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

    include_examples 'not authorized to visitors'
    include_examples 'not authorized to normal users'
  end
end
# rubocop:enable RSpec/EmptyExampleGroup
