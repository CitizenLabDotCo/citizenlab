# frozen_string_literal: true

require 'citizen_lab/mixins/feature_specification'

module IdAzureActiveDirectoryB2c
  module FeatureSpecification
    extend CitizenLab::Mixins::FeatureSpecification

    def self.feature_name
      'azure_ad_b2c_login'
    end

    def self.feature_title
      'Azure AD B2C Login'
    end

    def self.feature_description
      'Allow users to register and sign in with Azure AD B2C.'
    end

    def self.allowed_by_default
      false
    end

    def self.enabled_by_default
      false
    end

    add_setting 'tenant_name', schema: {
      title: 'Directory (tenant) Name',
      description: "The name of the Azure AD B2C tenant. The first part of the domain name. E.g. in citizenlabdevdemo.onmicrosoft.com, it's citizenlabdevdemo",
      type: 'string',
      private: true
    }

    add_setting 'tenant_id', schema: {
      title: 'Directory (tenant) ID',
      type: 'string',
      private: true
    }

    add_setting 'policy_name', schema: {
      title: 'Policy (User Flow, User Journey) Name',
      description: "The name of the policy (user flow, user journey) in the Azure AD B2C tenant. This is the policy that is used for sign-in and sign-up. tenant_name, tenant_id, and policy_name are used together to form such configuration URL https://{tenant_name}.b2clogin.com/tfp/{tenant_id}/{policy_name}/v2.0/.well-known/openid-configuration that returns JSON configuration.",
      type: 'string',
      private: true
    }

    add_setting 'tenant_id', schema: {
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
      pattern: "^https:\/\/.+"
    }

    add_setting 'login_mechanism_name', schema: {
      title: 'Login Mechanism Name',
      description: 'The Login Mechanism Name is used for user-facing copy. For instance, "Sign up with {login_mechanism_name}.".',
      type: 'string'
    }
  end
end
