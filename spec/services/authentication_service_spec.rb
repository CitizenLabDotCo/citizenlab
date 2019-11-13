
require "rails_helper"

describe AuthenticationService do
  let(:service) { AuthenticationService.new }

  describe "profile_to_user_attrs" do
    it "correctly interprets locale for azure_ad" do
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

    it "correctly interprets gender, locale and image for google" do
      auth = OpenStruct.new({
        provider: 'google',
        info: OpenStruct.new({
          "first_name" => 'Jos',
          "last_name" => 'Jossens',
          "email" => 'jos@josnet.com',
          "image" => 'http://www.josnet.com/my-picture'
        }),
        extra: OpenStruct.new({
          raw_info: OpenStruct.new({
            gender: 'female',
            locale: 'fr-FR',
          })
        })
      })

      expect_any_instance_of(OmniauthMethods::Google).to receive(:image_available?).and_return(true)
      user_attrs = service.profile_to_user_attrs(auth)

      expect(user_attrs).to include({
        locale: 'fr-FR',
        gender: 'female',
        remote_avatar_url: 'http://www.josnet.com/my-picture',
      }) 
    end
  end

  describe "attributes_user_cant_change" do
    context "for a user only using facebook" do
      it "returns no protected attributes" do
        identity = create(:facebook_identity)
        expect(service.attributes_user_cant_change(identity.user)).to eq []
      end
    end

    context "for a user only using franceconnect" do
      it "returns some protected attributes" do
        identity = create(:franceconnect_identity)
        expect(service.attributes_user_cant_change(identity.user)).to match_array [:first_name, :last_name, :gender, :birthyear]
      end
    end  
  end

  describe "custom_fields_user_cant_change" do
    context "for a user only using facebook" do
      it "returns no protected custom field keys" do
        identity = create(:facebook_identity)
        expect(service.custom_fields_user_cant_change(identity.user)).to eq []
      end
    end

    context "for a user only using franceconnect" do
      it "returns some protected custom field keys" do
        identity = create(:franceconnect_identity)
        expect(service.custom_fields_user_cant_change(identity.user)).to match_array [:gender, :birthyear]
      end
    end  
  end


end
