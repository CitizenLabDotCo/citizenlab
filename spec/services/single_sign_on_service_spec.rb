
require "rails_helper"

describe SingleSignOnService do
  let(:service) { SingleSignOnService.new }

  describe "profile_to_user_attrs" do
    it "creates a new user" do
      auth = OpenStruct.new({
        provider: 'azureactivedirectory',
        info: OpenStruct.new({
          "first_name" => 'Jos',
          "last_name" => 'Jossens',
          "email" => 'jos@josnet.com',
          "image" => 'http://www.josnet.com/my-picture'
        }),
        extra: OpenStruct.new({
          raw_info: OpenStruct.new({
            locale: 'fr'
          })
        })
      })
      expect(service.profile_to_user_attrs(auth)).to match({
        first_name: 'Jos',
        last_name: 'Jossens',
        email: 'jos@josnet.com',
        remote_avatar_url: 'http://www.josnet.com/my-picture',
        locale: 'en'
      })
    end
  end

end
