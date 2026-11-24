# frozen_string_literal: true

module CustomIdMethods::Twoday
  module TwodayVerification
    def verification_method_type
      :omniauth
    end

    def id
      '535bc0d4-cc3a-44e8-a339-2595ec330759'
    end

    def config_parameters_schema
      {
        ui_method_name: {
          type: 'string',
          description: 'The name this verification method will have in the UI',
          default: 'BankID eller Freja eID+'
        },
        domain: {
          private: true,
          type: 'string'
        },
        client_id: {
          private: true,
          type: 'string'
        },
        client_secret: {
          private: true,
          type: 'string'
        },
        enabled_for_verified_actions: {
          private: true,
          type: 'boolean',
          description: 'Whether this verification method should be enabled for verified actions.'
        },
        hide_from_profile: {
          private: true,
          type: 'boolean',
          description: 'Should verification be hidden in the user profile and under the username?'
        }
      }
    end

    def locked_attributes
      %i[first_name last_name]
    end

    def other_attributes
      %i[email]
    end

    def profile_to_uid(auth)
      auth['uid']
    end

    def ui_method_name
      config[:ui_method_name] || name
    end
  end
end
