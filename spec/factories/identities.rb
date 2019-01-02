FactoryBot.define do
  factory :identity do
    uid { SecureRandom.uuid }
    auth_hash {{}}
    user

    factory :facebook_identity do
      provider { 'facebook' }
      auth_hash {{
        "uid": "10214227319468725",
        "info": {
          "email": "Aaron.Kraus@telenet.be",
          "image": "http://graph.facebook.com/v2.6/10214227319468726/picture",
          "last_name": "Kraus",
          "first_name": "Aaron"
        },
        "extra": {
          "raw_info": {
            "id": "10214227319468725",
            "email": "Roxann.mailliard@telenet.be",
            "gender": "female",
            "locale": "nl_NL",
            "picture": {
              "data": {
                "url": "https://scontent.xx.fbcdn.net/v/t1.0-1/q720x720/20915085_10212256701764514_5465974268438220784_n.jpg?oh=0ac6948a2c4ef8fa8bf7e4fbab16401c&oe=5B3980D6",
                "width": 720,
                "height":
                720,
                "is_silhouette": false
              }
            },
            "timezone": 1,
            "age_range": {"min": 21},
            "last_name": "Kraus",
            "first_name": "Aaron",
            "third_party_id": "-AcY1HSyWpTc72eumxrIlh-YMxk"
          }
        },
        "provider": "facebook",
        "credentials": {
          "token": "EAAbteNXEnk8BAL5nJvsdVvkWfVMC2UfY4gYls2N8XTuTpQ8Qr8kdyExkZBI58DBaTg2cZCAwccrroAZBZC6H49acHxVPTy3T5Jib9Gv0yh4liLIzX8PFU3eX8llSexIKaLvZAudrmPnjR17emuQjVvkNqafwG0D4nZANFYTnswJwZDZR",
          "expires": true,
          "expires_at": 1526632531
        }
      }}
    end

    factory :franceconnect_identity do
      provider { 'franceconnect' }
      auth_hash {}
    end
  end
end
