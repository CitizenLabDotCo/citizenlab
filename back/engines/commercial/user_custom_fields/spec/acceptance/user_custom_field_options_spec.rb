# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'User Custom Field Options' do
  explanation 'Options to choose from in a custom field.'

  before do
    header 'Content-Type', 'application/json'
    @custom_field = create(:custom_field_select)
    @custom_field_options = create_list(:custom_field_option, 3, custom_field: @custom_field)
  end

  get 'web_api/v1/custom_fields/:custom_field_id/custom_field_options' do
    with_options scope: :page do
      parameter :number, 'Page number'
      parameter :size, 'Number of custom fields per page'
    end

    let(:custom_field_id) { @custom_field.id }

    example_request 'List all custom field options for a field' do
      assert_status 200
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 3
    end
  end

  get 'web_api/v1/custom_field_options/:id' do
    let(:id) { @custom_field_options.first.id }

    example_request 'Get one custom field option by id' do
      expect(status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response.dig(:data, :id)).to eq id
    end
  end

  context 'when admin' do
    before { admin_header_token }

    post 'web_api/v1/custom_fields/:custom_field_id/custom_field_options' do
      with_options scope: :custom_field_option do
        parameter :key, "A unique internal name for the option. Only letters, numbers and underscores allowed. Auto-generated from the title if not provided. Can't be changed afterwards", required: false
        parameter :title_multiloc, 'The title of the field as shown to users, in multiple locales', required: true
      end
      ValidationErrorHelper.new.error_fields(self, CustomFieldOption)

      let(:custom_field_id) { @custom_field.id }
      let(:custom_field_option) { build(:custom_field_option, custom_field: @custom_field) }

      describe do
        let(:key) { custom_field_option.key }
        let(:title_multiloc) { custom_field_option.title_multiloc }

        example_request 'Create a custom field option' do
          assert_status 201
          json_response = json_parse(response_body)
          expect(json_response.dig(:data, :attributes, :key)).to match key
          expect(json_response.dig(:data, :attributes, :title_multiloc).stringify_keys).to match title_multiloc
        end
      end

      describe do
        let(:key) { 'No spaces allowed' }
        let(:title_multiloc) { { 'en' => '' } }

        example '[error] Create an invalid custom field option', document: false do
          do_request
          assert_status 422
          json_response = json_parse response_body
          expect(json_response).to include_response_error(:key, 'invalid', value: key)
          expect(json_response).to include_response_error(:title_multiloc, 'blank')
        end
      end
    end

    patch 'web_api/v1/custom_field_options/:id' do
      with_options scope: :custom_field_option do
        parameter :title_multiloc, 'The title of the option as shown to users, in multiple locales', required: false
      end
      ValidationErrorHelper.new.error_fields(self, CustomField)

      let(:id) { create(:custom_field_option, custom_field: @custom_field).id }
      let(:title_multiloc) { { 'en' => 'New title' } }

      example_request 'Update a custom field option' do
        expect(response_status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :attributes, :title_multiloc).stringify_keys).to match title_multiloc
      end
    end

    patch 'web_api/v1/custom_field_options/:id/reorder' do
      with_options scope: :custom_field_option do
        parameter :ordering, 'The position, starting from 0, where the option should be at within its field. Options after will move down.', required: true
      end

      let(:id) { create(:custom_field_option, custom_field: @custom_field).id }
      let(:ordering) { 1 }

      example_request 'Reorder a custom field option' do
        expect(response_status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :attributes, :ordering)).to match ordering
        expect(@custom_field.options.order(:ordering)[1].id).to eq id
        expect(@custom_field.options.order(:ordering).map(&:ordering)).to eq (0..3).to_a
      end
    end

    delete 'web_api/v1/custom_field_options/:id' do
      let(:custom_field_option) { create(:custom_field_option, custom_field: @custom_field) }
      let(:id) { custom_field_option.id }

      example_request 'Delete a custom field option' do
        expect(response_status).to eq 200
        expect { CustomFieldOption.find(id) }.to raise_error(ActiveRecord::RecordNotFound)
      end

      example "[error] Delete a custom field option that's still referenced in a rules group" do
        create(
          :smart_group,
          rules: [
            { ruleType: 'custom_field_select', customFieldId: @custom_field.id, predicate: 'has_value', value: id }
          ]
        )
        do_request
        assert_status 422
        expect(CustomFieldOption.find(id)).to be_present
      end

      example "Deleting a custom field option that's still referenced in a user's setting", document: false do
        custom_field_values = { @custom_field.key => custom_field_option.key }
        user = create(:user, custom_field_values: custom_field_values)
        expect(user.reload.custom_field_values).to eq custom_field_values
        do_request
        expect(response_status).to eq 200
        expect { CustomFieldOption.find(id) }.to raise_error(ActiveRecord::RecordNotFound)
        expect(user.reload.custom_field_values).to eq({})
      end
    end
  end
end
