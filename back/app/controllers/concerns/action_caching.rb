# frozen_string_literal: true

module ActionCaching
  extend ActiveSupport::Concern

  included do
    include ActionController::Caching unless include?(ActionController::Caching)

    class_attribute :_action_cache_options, instance_accessor: false, default: {}
  end

  module ClassMethods
    # Supported options: :expires_in, :cache_path, :if, :unless
    #
    # Example usage:
    #   caches_action :index, :show, expires_in: 1.minute, cache_path: -> { request.query_parameters }
    def caches_action(*actions)
      options = actions.extract_options!
      cache_options = options.extract!(:expires_in, :cache_path)
      filter_options = options

      around_action(filter_options.merge(only: actions)) do |controller, block|
        controller.send(:cache_action, **cache_options, &block)
      end
    end
  end

  private

  def cache_action(expires_in: nil, cache_path: nil)
    cache_key = compute_cache_key(cache_path)
    cached_response = read_cache(cache_key)

    if cached_response
      render_cached_response(cached_response)
    else
      yield # Execute the action
      write_cache(cache_key, response, expires_in)
    end
  end

  def compute_cache_key(cache_path_option)
    # Example: api_response/example.org/web_api/v1/ideas?page=1&filter=active.json

    path = request.path.sub(/\.\w+$/, '') # Remove extension if present
    format = request.format.symbol || :json
    cache_key = "api_response/#{request.host}#{path}"

    if cache_path_option
      # Custom cache path (lambda or symbol)
      custom_params = if cache_path_option.is_a?(Proc)
        instance_exec(&cache_path_option)
      else
        send(cache_path_option)
      end

      # Convert to query string if it's a hash
      query_string = custom_params.is_a?(Hash) ? custom_params.to_query : custom_params.to_s
      cache_key = "#{cache_key}?#{query_string}" if query_string.present?
    end
    "#{cache_key}.#{format}"
  end

  def read_cache(key)
    cache_store.read(key)
  end

  def write_cache(key, response, expires_in)
    # For JSON API endpoints, we only need to cache body and status
    cached_response = {
      body: response.body,
      status: response.status
    }

    cache_store.write(key, cached_response, expires_in: expires_in)
  end

  def render_cached_response(cached_response)
    self.response_body = cached_response[:body]
    self.status = cached_response[:status]
    self.content_type = 'application/json; charset=utf-8'
  end

  def cache_store
    self.class.cache_store || Rails.cache
  end
end
