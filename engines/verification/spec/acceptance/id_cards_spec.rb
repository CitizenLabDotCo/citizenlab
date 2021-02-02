require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource "Verification Id Cards", admin_api: true do
 
  before do
    header "Content-Type", "application/json"
    header 'Authorization', ENV.fetch("ADMIN_API_TOKEN")
    configuration = AppConfiguration.instance
    settings = configuration.settings
    settings['verification'] = {
      allowed: true,
      enabled: true,
      verification_methods: [
        {name: 'id_card_lookup', method_name_multiloc: {en: 'By social security number'}, card_id_multiloc: {en: 'Social security number'}, card_id_placeholder: "xx-xxxxx-xx", card_id_tooltip_multiloc: {en: 'You can find this number on you card. We just check, we don\'t store it'}, explainer_image_url: "https://some.fake/image.png"},
      ],
    }
    configuration.save!
  end

  post "admin_api/verification_id_cards/bulk_replace" do
    with_options scope: :id_cards do
      parameter :file, "Base64 encoded CSV file"
    end

    before do
      @idea_card = create(:verification_id_card)
    end

    let(:card_ids) {[
      "aaa1",
      "bbb2",
      "ccc3",
      "ddd4",
      "eee5",
      "fff6",
      "ggg7",
      "hhh8",
      "iii9",
    ]}

    let(:file) { "data:text/csv;base64,#{Base64.encode64(card_ids.join("\n"))}" }

    example "Replaces all id cards with the CSV file contents" do
      expect{do_request}
        .to have_enqueued_job(Verification::LoadIdCardsJob)
        .with(card_ids)
      expect(status).to eq(201)
      expect{@idea_card.reload}.to raise_error(ActiveRecord::RecordNotFound)
    end
  end

  get "admin_api/verification_id_cards/count" do
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
