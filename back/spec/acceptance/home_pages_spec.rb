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
    before { admin_header_token }

    patch 'web_api/v1/home_page' do
      with_options scope: :home_page do
        parameter :banner_layout, 'the specific layout for the banner, one of: full_width_banner_layout two_column_layout two_row_layout fixed_ratio_layout'
        parameter :banner_avatars_enabled, 'if avatar display in the banner is enabled'
        parameter :banner_signed_in_header_multiloc, 'multiloc content for the banner header for signed in users'
        parameter :banner_signed_out_header_multiloc, 'multiloc content for the banner header for signed out users'
        parameter :banner_signed_out_subheader_multiloc, 'multiloc content for the banner subheader for signed out users'
        parameter :banner_signed_out_header_overlay_color, 'color for the header banner overlay for signed out users'
        parameter :banner_signed_out_header_overlay_opacity, 'color for the header banner overlay for signed out users, 0-100'
        parameter :bottom_info_section_enabled, 'if the bottom info section is enabled'
        parameter :bottom_info_section_multiloc, 'multiloc content for the bottom info section'
        parameter :banner_cta_signed_in_text_multiloc, 'multiloc content for the CTA for signed in users'
        parameter :banner_cta_signed_in_type, 'type of the CTA for signed in users, one of: customized_button no_button'
        parameter :banner_cta_signed_in_url, 'url for the CTA for signed in users'
        parameter :banner_cta_signed_out_text_multiloc, 'multiloc content for the CTA for signed out users'
        parameter :banner_cta_signed_out_type, 'type of the CTA for signed out users, one of: sign_up_button customized_button no_button'
        parameter :banner_cta_signed_out_url, 'url for the CTA for signed out users'
        parameter :header_bg, 'image for the header background'
        parameter :top_info_section_enabled, 'if the top info section is enabled'
        parameter :top_info_section_multiloc, 'multiloc content for the top info section'
        parameter :events_widget_enabled, 'if events are enabled'
        parameter :projects_enabled, 'if projects are enabled'
        parameter :projects_header_multiloc, 'multiloc content for the projects header'
        parameter :pinned_admin_publication_ids, 'the IDs of admin publications that are pinned to the page', type: :array
      end
      ValidationErrorHelper.new.error_fields(self, HomePage)

      let(:events_widget_enabled) { true }

      example_request 'Update the current home page' do
        expect(response_status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :attributes, :events_widget_enabled)).to be true
      end

      describe 'when banner_cta_signed_out_type: \'customized_button\' and button text and url both blank' do
        let(:banner_cta_signed_out_type) { 'customized_button' }
        let(:banner_cta_signed_out_text_multiloc) { { en: '' } }
        let(:banner_cta_signed_out_url) { '' }

        example_request 'Update the current home page' do
          expect(response_status).to eq 422
          json_response = json_parse(response_body)
          expect(json_response.dig(:errors, :banner_cta_signed_out_text_multiloc)).to eq([{ error: 'blank' }])
          expect(json_response.dig(:errors, :banner_cta_signed_out_url)).to eq([{ error: 'blank' }, { error: 'url', value: '' }])
        end
      end

      describe 'when banner_cta_signed_in_type: \'customized_button\' and button text and url both blank' do
        let(:banner_cta_signed_in_type) { 'customized_button' }
        let(:banner_cta_signed_in_text_multiloc) { { en: '' } }
        let(:banner_cta_signed_in_url) { '' }

        example_request 'Update the current home page' do
          expect(response_status).to eq 422
          json_response = json_parse(response_body)
          expect(json_response.dig(:errors, :banner_cta_signed_in_text_multiloc)).to eq([{ error: 'blank' }])
          expect(json_response.dig(:errors, :banner_cta_signed_in_url)).to eq([{ error: 'blank' }, { error: 'url', value: '' }])
        end
      end

      describe 'updating pins' do
        let(:project_one) { create(:project) }
        let(:project_two) { create(:project) }
        let(:pinned_admin_publication_ids) do
          [project_one.admin_publication.id, project_two.admin_publication.id]
        end

        example_request 'set pins to a page' do
          json_response = json_parse(response_body)
          expect(response_status).to eq 200
          expect(json_response.dig(:data, :relationships, :pinned_admin_publications, :data).length).to eq(2)
        end

        context 'when the page has pins already' do
          before do
            projects = create_list(:project, 3)
            home_page.pinned_admin_publications = projects.map(&:admin_publication)
            home_page.save!
          end

          example 'Update existing pins to a page', document: false do
            do_request
            json_response = json_parse(response_body)
            expect(response_status).to eq 200
            returned_ids = json_response.dig(:data, :relationships, :pinned_admin_publications, :data).pluck(:id)
            expect(returned_ids).to eq([project_one.admin_publication.id, project_two.admin_publication.id])
          end
        end
      end

      describe 'destroying pins' do
        let(:pinned_admin_publication_ids) do
          []
        end

        context 'when the page has pins already' do
          before do
            projects = create_list(:project, 3)
            home_page.pinned_admin_publications = projects.map(&:admin_publication)
            home_page.save!
          end

          example 'Removing existing pins from a page', document: false do
            do_request
            json_response = json_parse(response_body)
            expect(response_status).to eq 200
            expect(json_response.dig(:data, :relationships, :pinned_admin_publications, :data).length).to eq(0)
          end
        end
      end
    end
  end
end
