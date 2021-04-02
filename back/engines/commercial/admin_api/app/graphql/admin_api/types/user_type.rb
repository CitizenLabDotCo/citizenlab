module AdminApi
  class Types::UserType < GraphQL::Schema::Object
    description "A registered or invited person on the platform"

    class UserAvatar < GraphQL::Schema::Object
      field :small_url, String, null: false
      def small_url
        object.versions[:small]
      end

      field :medium_url, String, null: false
      def medium_url
        object.versions[:medium]
      end

      field :large_url, String, null: false
      def large_url
        object.versions[:large]
      end
    end

    field :id, ID, null: false
    field :first_name, String, null: true
    field :last_name, String, null: true
    field :email, String, null: true
    field :slug, String, null: true
    field :locale, String, null: true
    field :avatar, UserAvatar, null: true


    field :unsubscription_token, String, null: true

    def unsubscription_token
      object.email_campaigns_unsubscription_token&.token
    end
  end
end
