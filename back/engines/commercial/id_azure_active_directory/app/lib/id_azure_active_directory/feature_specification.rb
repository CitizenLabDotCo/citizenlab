# frozen_string_literal: true

require 'citizen_lab/mixins/feature_specification'

module IdAzureActiveDirectory
  module FeatureSpecification
    extend CitizenLab::Mixins::FeatureSpecification

    def self.feature_name
      'azure_ad_login'
    end

    def self.feature_title
      'Azure AD (Entra ID) Login'
    end

    def self.feature_description
      'Allow users to register and sign in with Entra ID (fka Azure Active Directory).'
    end

    def self.allowed_by_default
      false
    end

    def self.enabled_by_default
      false
    end

    add_setting 'tenant', schema: {
      title: 'Directory (tenant) ID',
      type: 'string',
      private: true
    }

    add_setting 'client_id', schema: {
      title: 'Application (client) ID',
      description: "Sometimes also called 'application_id'",
      type: 'string',
      private: true
    }

    add_setting 'logo_url', schema: {
      title: 'Logo',
      description: 'The full URL to the logo image that is shown on the authentication button. Logo should be approx. 25px in height.',
      type: 'string',
      pattern: '^https://.+'
    }

    add_setting 'login_mechanism_name', schema: {
      title: 'Login Mechanism Name',
      description: 'The Login Mechanism Name is used for user-facing copy. For instance, "Sign up with {login_mechanism_name}.".',
      type: 'string'
    }

    add_setting 'visibility', schema: {
      title: 'Visibility',
      description: 'Should this login mechanism be shown with other options to everyone, be hidden but available at /sign-in/admin or linked from the login modal via an "admin options" link?',
      type: 'string',
      enum: %w[show link hide],
      default: 'show'
    }
  end
end
