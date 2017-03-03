require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource "Users" do
  get "api/v1/users" do
    example "Listing users" do
      do_request

      status.should == 200
    end
  end
end
