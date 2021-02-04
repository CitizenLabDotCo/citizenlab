require 'rails_helper'
require 'rspec_api_documentation/dsl'

describe NLP::TaggingSuggestionService do
  let(:api) { NLP::API.new ENV.fetch('CL2_NLP_HOST') }
  let(:service) { NLP::TaggingSuggestionService.new(api) }

  before do
    Tagging::Tag.create(title_multiloc: {'en' => 'label', 'fr-BE' => 'label'})
    Tagging::Tag.create(title_multiloc: {'en' => 'item'})
    @tags = Tagging::Tag.all()
    @ideas = create_list(:idea, 2, title_multiloc: {'en' => 'I\'m an idea.'}, body_multiloc: {'en' => 'But I\'m not ideal.'}).push(create(:idea, title_multiloc: {'en' => 'I\'m an idea.', 'fr-BE': 'Je suis une idée.'}, body_multiloc: {'en' => 'But I\'m not ideal.', 'fr-BE' => 'Mais je ne suis pas idéale.'}))
    @tenant_id = Tenant.current.id
  end

  describe "suggest" do
    it "parses args and pass down" do
      allow(api).to receive(:zeroshot_classification).and_return(nil)
      service.suggest(@ideas, @tags, 'en')
      expect(api).to have_received(:zeroshot_classification).with(
        {:candidate_labels=>
          [{:label_id=> @tags[0].id, :text=>"label"},
          {:label_id=> @tags[1].id, :text=>"item"}],
         :documents=>
          [{:doc_id=>@ideas[0].id,
            :text=>"But I\'m not ideal."},
          {:doc_id=>@ideas[1].id,
            :text=>"But I\'m not ideal."},
          {:doc_id=>@ideas[2].id,
            :text=>"But I\'m not ideal."}
          ],
         :tenant_id=> @tenant_id,
         :locale => "en"
       }
      )
    end
    it "parses args and pass down" do
      allow(api).to receive(:zeroshot_classification).and_return(nil)
      service.suggest(@ideas, @tags, 'fr-BE')
      expect(api).to have_received(:zeroshot_classification).with(
        {:candidate_labels=>
          [{:label_id=> @tags[0].id, :text=>"label"}],
         :documents=>
          [{:doc_id=>@ideas[2].id,
            :text=>"Mais je ne suis pas idéale."}
          ],
         :tenant_id=> @tenant_id,
         :locale => "fr-BE"
       }
      )
    end
  end
end
