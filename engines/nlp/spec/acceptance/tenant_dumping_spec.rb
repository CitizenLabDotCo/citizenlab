require 'rails_helper'

RSpec.describe "Dumping tenants to cl2-nlp" do

  it "works" do
    create_list(:idea, 10)
    create_list(:area, 5)
    create_list(:topic, 5)
    dump = NLP::TenantDumpService.new.dump(Tenant.current)
    api = NLP::API.new(ENV.fetch("CL2_NLP_HOST"))
    
    expect { api.update_tenant(dump) }.not_to raise_error
    resp = api.ideas_clustering(Tenant.current.id, Tenant.current.settings.dig('core','locales').first, n_clusters: 3)
    expect(resp.parsed_response.dig('data','items')).to be_present

  end
end
