# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ActionCaching do
  include ActiveSupport::Testing::TimeHelpers

  let(:cache_key) { 'api_response/example.org/web_api/v1/test.json' }
  # Alias for backward compatibility with existing simple tests
  let(:controller_class) { test_controller_class }
  let(:controller) { new_test_controller }

  # Shared test controller class with all needed functionality
  let(:test_controller_class) do
    Class.new(ActionController::API) do
      include ActionCaching

      self.cache_store = ActiveSupport::Cache::MemoryStore.new

      attr_accessor :execution_count, :params

      def initialize
        super
        @execution_count = 0
        @params = {}
      end

      def action_name
        'index'
      end

      def controller_path
        'web_api/v1/test'
      end

      def index
        @execution_count += 1
        self.response_body = { data: 'fresh', count: @execution_count }.to_json
        self.status = 422
        self.content_type = 'application/json'
      end
    end
  end

  # Helper to create a controller instance with proper request/response setup
  def new_test_controller(klass = test_controller_class, request_path: '/web_api/v1/test', query_params: {})
    klass.new.tap do |ctrl|
      ctrl.request = instance_double(ActionDispatch::Request,
        path: request_path,
        host: 'example.org',
        format: instance_double(Mime::Type, symbol: :json),
        query_parameters: query_params)
      ctrl.response = ActionDispatch::Response.new
    end
  end

  # Helper to execute the caching around_action callbacks
  def execute_cached_action(controller)
    # Set up the action name so Rails knows which callbacks to run
    controller.action_name = 'index'

    # Use Rails' callback runner which respects :if and :unless
    controller.run_callbacks :process_action do
      controller.index
    end
  end

  before do
    test_controller_class.cache_store.clear
  end

  describe '.caches_action' do
    describe 'cache miss then cache hit' do
      it 'returns cached response without executing action body on cache hit' do
        test_controller_class.caches_action :index, expires_in: 1.minute

        # First request - cache miss
        test_controller1 = new_test_controller
        execute_cached_action(test_controller1)

        expect(test_controller1.execution_count).to eq(1)
        first_response = test_controller1.response.body
        expect(first_response).to eq('{"data":"fresh","count":1}')
        expect(test_controller1.content_type).to eq('application/json; charset=utf-8')

        cached_data = test_controller_class.cache_store.read(cache_key)
        expect(cached_data).to be_present
        expect(cached_data[:body]).to eq('{"data":"fresh","count":1}')
        expect(cached_data[:status]).to eq(422)

        # Second request - cache hit
        test_controller2 = new_test_controller
        execute_cached_action(test_controller2)

        expect(test_controller2.execution_count).to eq(0) # Action body NOT executed
        expect(test_controller2.response.body).to eq(first_response)
        expect(test_controller2.response.status).to eq(422)
        expect(test_controller2.content_type).to eq('application/json; charset=utf-8')
      end
    end

    describe 'cache expiration' do
      it 'expires cache and re-executes action after expiration time' do
        test_controller_class.caches_action :index, expires_in: 1.minute

        # First request - cache miss
        test_controller1 = new_test_controller
        execute_cached_action(test_controller1)

        expect(test_controller1.execution_count).to eq(1)
        expect(test_controller_class.cache_store.read(cache_key)).to be_present

        # Second request within 1 minute - cache hit
        travel 50.seconds
        test_controller2 = new_test_controller
        execute_cached_action(test_controller2)

        expect(test_controller2.execution_count).to eq(0) # Still cached

        # Travel forward past expiration time
        travel 11.seconds

        # Third request after expiration - cache miss again
        test_controller3 = new_test_controller
        execute_cached_action(test_controller3)

        expect(test_controller3.execution_count).to eq(1) # Action executed again
        expect(test_controller3.response.body).to eq('{"data":"fresh","count":1}')

        travel_back
      end
    end

    describe 'conditional caching with :if option' do
      it 'does not cache when :if condition returns false' do
        test_controller = new_test_controller
        test_controller.define_singleton_method(:cacheable?) { false }
        test_controller_class.caches_action :index, expires_in: 1.minute, if: :cacheable?

        execute_cached_action(test_controller)

        expect(test_controller_class.cache_store.read(cache_key)).to be_nil
      end

      it 'caches when :if condition returns true' do
        test_controller = new_test_controller
        test_controller.define_singleton_method(:cacheable?) { true }
        test_controller_class.caches_action :index, expires_in: 1.minute, if: :cacheable?

        execute_cached_action(test_controller)
        expect(test_controller_class.cache_store.read(cache_key)).to be_present
      end

      it 'supports :if with proc' do
        test_controller = new_test_controller
        test_controller_class.caches_action :index, expires_in: 1.minute, if: -> { false }

        execute_cached_action(test_controller)

        expect(test_controller_class.cache_store.read(cache_key)).to be_nil
      end
    end

    describe 'conditional caching with :unless option' do
      it 'does not cache when :unless condition returns true' do
        test_controller = new_test_controller
        test_controller.define_singleton_method(:skip_cache?) { true }
        test_controller_class.caches_action :index, expires_in: 1.minute, unless: :skip_cache?

        execute_cached_action(test_controller)

        expect(test_controller_class.cache_store.read(cache_key)).to be_nil
      end

      it 'caches when :unless condition returns false' do
        test_controller = new_test_controller
        test_controller.define_singleton_method(:skip_cache?) { false }
        test_controller_class.caches_action :index, expires_in: 1.minute, unless: :skip_cache?

        execute_cached_action(test_controller)

        expect(test_controller_class.cache_store.read(cache_key)).to be_present
      end
    end

    describe 'cache_path option' do
      it 'creates separate cache entries for different cache_path values' do
        test_controller_class.caches_action :index, expires_in: 1.minute, cache_path: -> { { page: params[:page] } }

        # First request with page=1
        test_controller1 = new_test_controller(query_params: { page: 1 })
        test_controller1.params = { page: 1 }
        execute_cached_action(test_controller1)

        expect(test_controller1.execution_count).to eq(1)
        cache_key1 = 'api_response/example.org/web_api/v1/test?page=1.json'
        expect(test_controller_class.cache_store.read(cache_key1)).to be_present

        # Second request with page=2
        test_controller2 = new_test_controller(query_params: { page: 2 })
        test_controller2.params = { page: 2 }
        execute_cached_action(test_controller2)

        expect(test_controller2.execution_count).to eq(1)
        cache_key2 = 'api_response/example.org/web_api/v1/test?page=2.json'
        expect(test_controller_class.cache_store.read(cache_key2)).to be_present
      end
    end
  end

  describe '#compute_cache_key' do
    before do
      allow(controller.request).to receive_messages(path: '/web_api/v1/ideas', host: 'example.org', format: instance_double(Mime::Type, symbol: :json))
    end

    it 'removes existing extension from path' do
      allow(controller.request).to receive(:path).and_return('/web_api/v1/ideas.txt')

      key = controller.send(:compute_cache_key, nil)
      expect(key).to eq('api_response/example.org/web_api/v1/ideas.json')
    end

    it 'uses json format by default when format is nil' do
      allow(controller.request).to receive(:format).and_return(instance_double(Mime::Type, symbol: nil))

      key = controller.send(:compute_cache_key, nil)
      expect(key).to eq('api_response/example.org/web_api/v1/ideas.json')
    end

    it 'includes the host in the cache key' do
      allow(controller.request).to receive(:host).and_return('different-host.com')

      key = controller.send(:compute_cache_key, nil)
      expect(key).to eq('api_response/different-host.com/web_api/v1/ideas.json')
    end

    context 'with cache_path option' do
      it 'includes query parameters from cache_path proc returning hash' do
        cache_path_proc = -> { { page: 1, filter: 'active' } }

        key = controller.send(:compute_cache_key, cache_path_proc)
        expect(key).to eq('api_response/example.org/web_api/v1/ideas?filter=active&page=1.json')
      end

      it 'handles empty hash from cache_path proc' do
        cache_path_proc = -> { {} }

        key = controller.send(:compute_cache_key, cache_path_proc)
        expect(key).to eq('api_response/example.org/web_api/v1/ideas.json')
      end

      it 'handles cache_path proc returning string' do
        cache_path_proc = -> { 'custom_param=value' }

        key = controller.send(:compute_cache_key, cache_path_proc)
        expect(key).to eq('api_response/example.org/web_api/v1/ideas?custom_param=value.json')
      end

      it 'handles cache_path as symbol method name' do
        controller.define_singleton_method(:custom_cache_params) { { sort: 'name' } }

        key = controller.send(:compute_cache_key, :custom_cache_params)
        expect(key).to eq('api_response/example.org/web_api/v1/ideas?sort=name.json')
      end

      it 'handles nil value from cache_path proc' do
        cache_path_proc = -> {}

        key = controller.send(:compute_cache_key, cache_path_proc)
        expect(key).to eq('api_response/example.org/web_api/v1/ideas.json')
      end
    end
  end

  describe 'ActionController::Caching inclusion' do
    it 'includes ActionController::Caching' do
      expect(controller_class.ancestors).to include(ActionController::Caching)
    end

    it 'does not include ActionController::Caching twice' do
      # Create a new class that already includes ActionController::Caching
      klass = Class.new(ActionController::API) do
        include ActionController::Caching
        include ActionCaching
      end

      # Count how many times ActionController::Caching appears
      count = klass.ancestors.count(ActionController::Caching)
      expect(count).to eq(1)
    end
  end
end
