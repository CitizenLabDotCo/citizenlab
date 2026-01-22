# frozen_string_literal: true

require 'rails_helper'

# Mock decoded token response for testing
module GemExtensions
  module OmniAuth
    module Strategies
      module OpenIdConnectSpec
        DecodedToken = Struct.new(:raw_attributes, keyword_init: true)
      end
    end
  end
end

RSpec.describe GemExtensions::OmniAuth::Strategies::OpenIdConnect do
  let(:decoded_token_class) { GemExtensions::OmniAuth::Strategies::OpenIdConnectSpec::DecodedToken }

  let(:strategy_class) do
    token_class = decoded_token_class
    Class.new do
      attr_accessor :config, :name

      define_method(:token_class) { token_class }

      def initialize
        @name = 'test_provider'
        @decode_call_count = 0
      end

      # Track how many times the original decode_id_token is called
      attr_reader :decode_call_count

      def decode_id_token_original(_id_token)
        @decode_call_count += 1
        # Simulate successful decode
        token_class.new(raw_attributes: { sub: '123' })
      end

      # This will be overridden by prepend
      alias_method :decode_id_token, :decode_id_token_original

      prepend GemExtensions::OmniAuth::Strategies::OpenIdConnect
    end
  end

  let(:strategy) { strategy_class.new }

  describe '#decode_id_token' do
    context 'when decoding succeeds on first attempt' do
      it 'returns the decoded token' do
        result = strategy.decode_id_token('valid_token')
        expect(result.raw_attributes[:sub]).to eq('123')
      end

      it 'does not retry' do
        strategy.decode_id_token('valid_token')
        expect(strategy.decode_call_count).to eq(1)
      end
    end

    context 'when KidNotFound error occurs' do
      let(:strategy_class_with_kid_error) do
        token_class = decoded_token_class
        Class.new do
          attr_accessor :config, :public_key, :name

          define_method(:token_class) { token_class }

          def initialize
            @name = 'test_provider'
            @decode_call_count = 0
          end

          attr_reader :decode_call_count

          def decode_id_token_original(_id_token)
            @decode_call_count += 1
            if @decode_call_count == 1
              # First call raises KidNotFound
              raise JSON::JWK::Set::KidNotFound, 'Key with kid xyz not found'
            else
              # Second call succeeds (after cache refresh)
              token_class.new(raw_attributes: { sub: '123' })
            end
          end

          alias_method :decode_id_token, :decode_id_token_original

          prepend GemExtensions::OmniAuth::Strategies::OpenIdConnect
        end
      end

      let(:strategy_with_error) { strategy_class_with_kid_error.new }

      it 'clears the config and public_key caches and retries' do
        strategy_with_error.config = { cached: true }
        strategy_with_error.public_key = 'cached_key'

        result = strategy_with_error.decode_id_token('token_with_new_kid')

        expect(result.raw_attributes[:sub]).to eq('123')
        expect(strategy_with_error.decode_call_count).to eq(2)
        expect(strategy_with_error.config).to be_nil
        expect(strategy_with_error.public_key).to be_nil
      end

      it 'logs a warning about the cache refresh' do
        allow(Rails.logger).to receive(:warn)

        strategy_with_error.decode_id_token('token_with_new_kid')

        expect(Rails.logger).to have_received(:warn).with(/KidNotFound error for provider 'test_provider', refreshing JWKS cache/)
      end
    end

    context 'when KidNotFound error persists after retry' do
      let(:strategy_class_with_persistent_error) do
        Class.new do
          attr_accessor :config, :name

          def initialize
            @name = 'test_provider'
            @decode_call_count = 0
          end

          attr_reader :decode_call_count

          def decode_id_token_original(_id_token)
            @decode_call_count += 1
            raise JSON::JWK::Set::KidNotFound, 'Key with kid xyz not found'
          end

          alias_method :decode_id_token, :decode_id_token_original

          prepend GemExtensions::OmniAuth::Strategies::OpenIdConnect
        end
      end

      let(:strategy_with_persistent_error) { strategy_class_with_persistent_error.new }

      it 'raises the error after one retry' do
        expect { strategy_with_persistent_error.decode_id_token('token_with_unknown_kid') }
          .to raise_error(JSON::JWK::Set::KidNotFound)

        # Should have tried twice: initial + 1 retry
        expect(strategy_with_persistent_error.decode_call_count).to eq(2)
      end
    end
  end
end
