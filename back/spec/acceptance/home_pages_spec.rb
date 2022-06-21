# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Home Page' do
  explanation 'Test for home pages.'

  let!(:home_page) { create(:home_page) }

  before do
    header 'Content-Type', 'application/json'
  end

  get 'web_api/v1/home_page' do
    example_request 'retrieve the single homepage for the tenant' do
      expect(status).to eq(200)
      json_response = json_parse(response_body)
      expect(json_response.dig(:data, :attributes, :banner_signed_in_header_multiloc, :'nl-BE')).to eq 'Welkom!'
    end
  end

  context 'when admin' do
    before do
      @admin = create(:admin)
      token = Knock::AuthToken.new(payload: @admin.to_token_payload).token
      header 'Authorization', "Bearer #{token}"
    end

    patch 'web_api/v1/home_page' do
      with_options scope: :home_page do
        parameter :banner_enabled, 'if the banner is enabled'
        # parameter :banner_layout, 'if the banner is enabled'
        # parameter :banner_avatars_enabled, 'if the banner is enabled'
        # parameter :banner_signed_in_header_multiloc, 'if the banner is enabled'
        # parameter :banner_signed_out_header_multiloc, 'if the banner is enabled'
        # parameter :banner_signed_out_subheader_multiloc, 'if the banner is enabled'
        # parameter :banner_signed_out_header_overlay_color, 'if the banner is enabled'
        # parameter :banner_signed_out_header_overlay_opacity, 'if the banner is enabled'
        # parameter :cta_signed_in_text_multiloc, 'if the banner is enabled'
        # parameter :cta_signed_in_type, 'if the banner is enabled'
        # parameter :cta_signed_in_url, 'if the banner is enabled'
        # parameter :cta_signed_out_text_multiloc, 'if the banner is enabled'
        # parameter :cta_signed_out_type, 'if the banner is enabled'
        # parameter :cta_signed_out_url, 'if the banner is enabled'
        # parameter :header_bg, 'if the banner is enabled'
        # parameter :top_info_section_enabled, 'if the banner is enabled'
        # parameter :top_info_section_multiloc, 'if the banner is enabled'
        # parameter :bottom_info_section_enabled, 'if the banner is enabled'
        # parameter :bottom_info_section_multiloc, 'if the banner is enabled'
        parameter :events_enabled, 'if the events are enabled'
        # parameter :projects_enabled, 'if the banner is enabled'
        # parameter :projects_header_multiloc, 'if the banner is enabled'
        parameter :pinned_admin_publication_ids, 'the IDs of admin publications that are pinned to the page', type: :array
      end
      ValidationErrorHelper.new.error_fields(self, HomePage)

      let(:banner_enabled) { true }
      let(:events_enabled) { true }

      example_request 'Update the current home page' do
        expect(response_status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :attributes, :banner_enabled)).to be true
      end

      describe do
        let(:project_one) { create(:project) }
        let(:project_two) { create(:project) }
        let(:pinned_admin_publication_ids) do
          [project_one.admin_publication.id, project_two.admin_publication.id]
        end

        example_request 'Update pins to a page' do
          json_response = json_parse(response_body)
          expect(response_status).to eq 200
          expect(json_response.dig(:data, :relationships, :pinned_admin_publications, :data).length).to eq(2)
        end
      end
    end
  end
end
