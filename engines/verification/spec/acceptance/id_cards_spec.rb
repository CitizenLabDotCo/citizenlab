require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource "Verification Id Cards" do
 
  before do
    @admin = create(:admin)
    token = Knock::AuthToken.new(payload: @admin.to_token_payload).token
    header 'Authorization', "Bearer #{token}"
    header "Content-Type", "application/json"
    @tenant = Tenant.current
    settings = @tenant.settings
    settings['verification'] = {
      allowed: true,
      enabled: true,
      verification_methods: [
        {name: 'id_card_lookup', method_name_multiloc: {en: 'By social security number'}, card_id_multiloc: {en: 'Social security number'}, card_id_placeholder: "xx-xxxxx-xx", card_id_tooltip_multiloc: {en: 'You can find this number on you card. We just check, we don\'t store it'}, explainer_image_url: "https://some.fake/image.png"},
      ],
    }
    @tenant.save!
  end

  post "web_api/v1/verification_id_cards/bulk_replace" do
    with_options scope: :id_cards do
      parameter :file, "Base64 encoded CSV file"
    end

    before do
      @idea_card = create(:verification_id_card)
    end

    let(:file) { "data:text/csv;base64,#{Base64.encode64("""
      aaa1
      bbb2
      ccc3
      ddd4
      eee5
      fff6
      ggg7
      hhh8
      iii9
    """)}"
    }

    example_request "Replaces all id cards with the CSV file contents" do
      expect(status).to eq(201)
      expect{@idea_card.reload}.to raise_error
      expect(Verification::IdCard.count).to eq 9
    end
  end

  get "web_api/v1/verification_id_cards/count" do
    before do
      @idea_card = create(:verification_id_card)
    end

    example_request "Count id cards in the system" do
      expect(status).to eq(200)
      json_response = json_parse(response_body)
      expect(json_response[:count]).to eq 1
    end
  end


end
