require "koala"

class SocialAuthService

  def get_social_profile_info network, access_token
    self.send("get_#{network}_profile_info", access_token)
  end

  def get_facebook_profile_info access_token
    graph = Koala::Facebook::API.new(access_token)
    graph.get_object("me?fields=first_name,last_name,middle_name,email,birthday,education,gender,interested_in,locale,location,third_party_id,timezone,age_range,picture.width(640).height(640)")
  end

  def social_profile_to_user_attrs network, profile
    self.send("#{network}_profile_to_user_attrs", profile)
  end

  def facebook_profile_to_user_attrs profile
    user_attrs = {
      "first_name" => profile['first_name'],
      "last_name" => profile['last_name'],
      "email" => profile['email'],
      "demographics" => {
        "gender" => profile['gender'],
      },
      "services" => {
        "facebook" => {
          "updated_at" => Time.now,
          "profile" => profile
        }
      }
    }

    picture = profile.dig('picture', 'data')

    if picture && !picture['is_silhouette']
      user_attrs['remote_avatar_url'] = picture['url']
    end

    user_attrs
  end




  def updated_user_services user, network, profile
    services = user.services
    services[network] = {
      "updated_at" => Time.now,
      "profile" => profile
    }
    services
  end




  def verify_user network, profile
    self.send("verify_#{network}_user", profile)
  end

  def verify_facebook_user profile
    User.find_by(email: profile["email"])
  end


end