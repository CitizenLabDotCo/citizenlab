# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Home Page' do
  explanation 'Test for home pages.'

  before do
    header 'Content-Type', 'application/json'
    @homepage = create(:home_page, {
      banner_signed_in_header_multiloc: {
        en: 'testing',
        'nl-BE': 'test title multiloc'
      }
    })
  end

  get 'web_api/v1/home_page' do
    example_request 'retrieve the single homepage for the tenant' do
      expect(status).to eq(200)
      json_response = json_parse(response_body)
      expect(json_response.dig(:data, :attributes, :banner_signed_in_header_multiloc, :'nl-BE')).to eq 'test title multiloc'
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
      end
      ValidationErrorHelper.new.error_fields(self, HomePage)

      let(:home_page) { create(:home_page) }
      let(:banner_enabled) { true }
      let(:events_enabled) { true }

      example_request 'Update the home page' do
        expect(response_status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :attributes, :banner_enabled)).to be true
      end
    end
  end
end
