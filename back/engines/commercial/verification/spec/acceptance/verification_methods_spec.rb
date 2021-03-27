require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource "Verification methods" do

  explanation "Verification methods are the channels that lets users prove they're real. (e.g. itsme)"

  before do
    header "Content-Type", "application/json"
    configuration = AppConfiguration.instance
    settings = configuration.settings
    settings['verification'] = {
      allowed: true,
      enabled: true,
      verification_methods: [
        { name: 'cow', api_username: 'fake_username', api_password: 'fake_password', rut_empresa: 'fake_rut_empresa' },
        { name: 'id_card_lookup', method_name_multiloc: { en: 'By social security number' }, card_id_multiloc: { en: 'Social security number' }, card_id_placeholder: "xx-xxxxx-xx", card_id_tooltip_multiloc: { en: 'You can find this number on you card. We just check, we don\'t store it' }, explainer_image_url: "https://some.fake/image.png" },
      ],
    }
    configuration.save!
  end

  get "web_api/v1/verification_methods" do
    with_options scope: :page do
      parameter :number, "Page number"
      parameter :size, "Number of verification methods per page"
    end

    example_request "Lists all active verification methods" do
      expect(status).to eq(200)
      json_response = json_parse(response_body)
      expect(json_response[:data]).to eq([
        { :id => "7ccd453d-0eaf-412a-94a2-ae703b1b3e3f", :type => "verification_method", :attributes => { :name => "cow" } },
        { :id => "516e134d-e22b-4386-a783-0db4c2708256", :type => "verification_method", :attributes => {
          :name => "id_card_lookup",
          method_name_multiloc: { en: 'By social security number' },
          card_id_multiloc: { en: 'Social security number' },
          card_id_tooltip_multiloc: { en: 'You can find this number on you card. We just check, we don\'t store it' },
          card_id_placeholder: "xx-xxxxx-xx",
          explainer_image_url: "https://some.fake/image.png"
        } },
      ])
    end
  end

end
