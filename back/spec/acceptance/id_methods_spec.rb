# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Id methods' do
  explanation 'Id methods are the methods for people to either login/signup (authentication), prove their identity (verification) or both.'

  before do
    header 'Content-Type', 'application/json'
    create(:custom_field_gender)
    create(:custom_field_birthyear)
    configuration = AppConfiguration.instance
    configuration.settings['id_config'] = {
      allowed: true,
      enabled: true,
      id_methods: [
        {
          name: 'cow',
          api_username: 'fake_username',
          api_password: 'fake_password',
          rut_empresa: 'fake_rut_empresa'
        },
        {
          name: 'id_card_lookup',
          ui_method_name: 'By social security number',
          card_id: 'Social security number',
          card_id_placeholder: 'xx-xxxxx-xx',
          card_id_tooltip: 'You can find this number on you card. We just check, we don\'t store it',
          explainer_image_url: 'https://some.fake/image.png'
        },
        {
          name: 'fake_sso',
          enabled_for_verified_actions: true
        }
      ]
    }
    configuration.save!
  end

  get 'web_api/v1/id_methods' do
    with_options scope: :page do
      parameter :number, 'Page number'
      parameter :size, 'Number of id methods per page'
    end

    example_request 'Lists all active id methods' do
      expect(status).to eq(200)
      expect(response_data.length).to eq 3
      expect(response_data[0]).to eq(
        {
          id: '7ccd453d-0eaf-412a-94a2-ae703b1b3e3f',
          type: 'id_method',
          attributes: {
            name: 'cow',
            authentication_method: false,
            verification_method: true,
            method_metadata: {
              allowed_for_verified_actions: false,
              locked_attributes: [],
              locked_custom_fields: [],
              name: 'cow',
              other_attributes: [],
              other_custom_fields: []
            }
          }
        }
      )
      expect(response_data[1]).to eq(
        {
          id: '8bb00a8d-26a5-4e00-866d-36e23986d441',
          type: 'id_method',
          attributes: {
            name: 'fake_sso',
            authentication_method: true,
            verification_method: true,
            method_metadata: {
              allowed_for_verified_actions: true,
              name: 'Fake SSO',
              locked_attributes: [
                { en: 'First name(s)', 'fr-FR': 'Prénom(s)', 'nl-NL': 'Voornamen' },
                { en: 'Last name', 'fr-FR': 'Nom de famille', 'nl-NL': 'Achternaam' }
              ],
              other_attributes: [
                { en: 'Email', 'fr-FR': 'E-mail', 'nl-NL': 'E-mail' }
              ],
              locked_custom_fields: [
                { en: 'gender' }, { en: 'birthyear' }
              ],
              other_custom_fields: []
            }
          }
        }
      )
      expect(response_data[2]).to eq(
        {
          id: '516e134d-e22b-4386-a783-0db4c2708256',
          type: 'id_method',
          attributes: {
            card_id: 'Social security number',
            card_id_placeholder: 'xx-xxxxx-xx',
            card_id_tooltip: "You can find this number on you card. We just check, we don't store it",
            explainer_image_url: 'https://some.fake/image.png',
            authentication_method: false,
            verification_method: true,
            method_metadata: {
              allowed_for_verified_actions: false,
              locked_attributes: [],
              locked_custom_fields: [],
              name: 'id_card_lookup',
              other_attributes: [],
              other_custom_fields: []
            },
            name: 'id_card_lookup',
            ui_method_name: 'By social security number'
          }
        }
      )
    end
  end

  get 'web_api/v1/id_methods/first_enabled_for_verified_actions' do
    example_request 'Returns the first id method enabled for verified actions' do
      expect(status).to eq(200)
      expect(response_data).to eq(
        {
          id: '8bb00a8d-26a5-4e00-866d-36e23986d441',
          type: 'id_method',
          attributes: {
            name: 'fake_sso',
            authentication_method: true,
            verification_method: true,
            method_metadata: {
              allowed_for_verified_actions: true,
              name: 'Fake SSO',
              locked_attributes: [
                { en: 'First name(s)', 'fr-FR': 'Prénom(s)', 'nl-NL': 'Voornamen' },
                { en: 'Last name', 'fr-FR': 'Nom de famille', 'nl-NL': 'Achternaam' }
              ],
              other_attributes: [
                { en: 'Email', 'fr-FR': 'E-mail', 'nl-NL': 'E-mail' }
              ],
              locked_custom_fields: [
                { en: 'gender' }, { en: 'birthyear' }
              ],
              other_custom_fields: []
            }
          }
        }
      )
    end
  end

  get 'web_api/v1/id_methods/first_enabled_verification_method' do
    example_request 'Returns the first id method enabled' do
      expect(status).to eq(200)
      expect(response_data).to eq(
        {
          id: '7ccd453d-0eaf-412a-94a2-ae703b1b3e3f',
          type: 'id_method',
          attributes: {
            name: 'cow',
            authentication_method: false,
            verification_method: true,
            method_metadata: {
              allowed_for_verified_actions: false,
              locked_attributes: [],
              locked_custom_fields: [],
              name: 'cow',
              other_attributes: [],
              other_custom_fields: []
            }
          }
        }
      )
    end
  end
end
