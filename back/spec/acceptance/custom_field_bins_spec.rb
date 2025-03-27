# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Custom Field Bins' do
  explanation 'Together bins define a subdivision to group together certain custom field values, mostly useful for analytical purposes.'

  context 'as an admin' do
    before do
      @user = create(:admin)
      header_token_for @user
      header 'Content-Type', 'application/json'
    end

    get 'web_api/v1/custom_fields/:custom_field_id/custom_field_bins' do
      with_options scope: :page do
        parameter :number, 'Page number'
        parameter :size, 'Number of bins per page'
      end

      let(:bin) { create(:value_bin) }
      let(:custom_field) { bin.custom_field }
      let!(:bin2) { create(:value_bin, custom_field:, values: [2, 3]) }
      let(:custom_field_id) { custom_field.id }

      example_request 'Lists all bins for a specific custom field' do
        expect(status).to eq(200)
        expect(response_data.size).to eq 2
        expect(response_data[0][:attributes]).to match(
          values: [1],
          range: nil,
          type: 'CustomFieldBins::ValueBin',
          created_at: kind_of(String),
          updated_at: kind_of(String)
        )
        expect(response_data[0][:relationships]).to match(
          custom_field: {
            data: {
              id: custom_field.id,
              type: 'custom_field'
            }
          },
          custom_field_option: {
            data: nil
          }
        )
      end
    end

    get 'web_api/v1/custom_field_bins/:id' do
      let(:bin) { create(:range_bin) }
      let(:id) { bin.id }

      example_request 'Get one bin by id' do
        expect(status).to eq 200
        expect(response_data[:attributes]).to match(
          range: { begin: 1, end: 10 },
          values: nil,
          type: 'CustomFieldBins::RangeBin',
          created_at: kind_of(String),
          updated_at: kind_of(String)
        )
        expect(response_data[:relationships]).to match(
          custom_field: {
            data: {
              id: bin.custom_field.id,
              type: 'custom_field'
            }
          },
          custom_field_option: {
            data: nil
          }
        )
      end
    end
  end

  context 'as a normal user' do
    before do
      @user = create(:user)
      header_token_for @user
      header 'Content-Type', 'application/json'
    end

    get 'web_api/v1/custom_field_bins/:id' do
      let(:bin) { create(:option_bin) }
      let(:id) { bin.id }

      example_request 'Get one bin by id' do
        expect(status).to eq 401
      end
    end
  end
end
