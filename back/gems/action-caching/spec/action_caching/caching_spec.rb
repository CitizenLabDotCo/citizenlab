# frozen_string_literal: true

require 'spec_helper'

RSpec.describe ActionCaching::Caching do
  let(:cache_store) { ActiveSupport::Cache::MemoryStore.new }

  let(:controller_class) do
    Class.new(ActionController::API) do
      include ActionCaching::Caching

      self.cache_store = ActiveSupport::Cache::MemoryStore.new

      attr_accessor :request, :response

      def initialize
        super
        @request = double('request')
        @response = double('response', body: '{"data":"test"}', status: 200)
      end

      def action_name
        'index'
      end

      def controller_path
        'web_api/v1/test'
      end
    end
  end

  let(:controller) { controller_class.new }

  before do
    controller_class.cache_store.clear
  end

  describe '.caches_action' do
    it 'defines caches_action class method' do
      expect(controller_class).to respond_to(:caches_action)
    end

    it 'stores cache options for the action' do
      controller_class.caches_action :index, expires_in: 1.minute

      expect(controller_class._action_cache_options[:index]).to eq(expires_in: 1.minute)
    end

    it 'stores cache options for multiple actions' do
      controller_class.caches_action :index, :show, expires_in: 5.minutes

      expect(controller_class._action_cache_options[:index]).to eq(expires_in: 5.minutes)
      expect(controller_class._action_cache_options[:show]).to eq(expires_in: 5.minutes)
    end

    it 'supports cache_path option' do
      controller_class.caches_action :index, cache_path: -> { 'custom' }

      expect(controller_class._action_cache_options[:index][:cache_path]).to be_a(Proc)
    end
  end

  describe '#compute_cache_key' do
    before do
      allow(controller.request).to receive_messages(path: '/web_api/v1/ideas', host: 'example.org', format: double(symbol: :json))
    end

    it 'generates cache key with views prefix' do
      key = controller.send(:compute_cache_key, nil)
      expect(key).to eq('views/example.org/web_api/v1/ideas.json')
    end

    it 'removes existing extension from path' do
      allow(controller.request).to receive(:path).and_return('/web_api/v1/ideas.json')

      key = controller.send(:compute_cache_key, nil)
      expect(key).to eq('views/example.org/web_api/v1/ideas.json')
    end

    it 'uses json format by default when format is nil' do
      allow(controller.request).to receive(:format).and_return(double(symbol: nil))

      key = controller.send(:compute_cache_key, nil)
      expect(key).to eq('views/example.org/web_api/v1/ideas.json')
    end

    it 'includes the host in the cache key' do
      allow(controller.request).to receive(:host).and_return('different-host.com')

      key = controller.send(:compute_cache_key, nil)
      expect(key).to eq('views/different-host.com/web_api/v1/ideas.json')
    end

    context 'with cache_path option' do
      it 'includes query parameters from cache_path proc returning hash' do
        cache_path_proc = -> { { page: 1, filter: 'active' } }

        key = controller.send(:compute_cache_key, cache_path_proc)
        expect(key).to match(%r{views/example\.org/web_api/v1/ideas\?.*\.json})
        expect(key).to include('page=1')
        expect(key).to include('filter=active')
      end

      it 'handles empty hash from cache_path proc' do
        cache_path_proc = -> { {} }

        key = controller.send(:compute_cache_key, cache_path_proc)
        expect(key).to eq('views/example.org/web_api/v1/ideas.json')
      end

      it 'handles cache_path proc returning string' do
        cache_path_proc = -> { 'custom_param=value' }

        key = controller.send(:compute_cache_key, cache_path_proc)
        expect(key).to eq('views/example.org/web_api/v1/ideas?custom_param=value.json')
      end

      it 'handles cache_path as symbol method name' do
        allow(controller).to receive(:custom_cache_params).and_return({ sort: 'name' })

        key = controller.send(:compute_cache_key, :custom_cache_params)
        expect(key).to eq('views/example.org/web_api/v1/ideas?sort=name.json')
      end

      it 'handles nil value from cache_path proc' do
        cache_path_proc = -> {}

        key = controller.send(:compute_cache_key, cache_path_proc)
        expect(key).to eq('views/example.org/web_api/v1/ideas.json')
      end
    end
  end

  describe '#write_cache' do
    let(:response) { double('response', body: '{"result":"success"}', status: 200) }
    let(:cache_key) { 'views/example.org/web_api/v1/test.json' }

    it 'writes response to cache with body and status' do
      controller.send(:write_cache, cache_key, response, 1.minute)

      cached = controller_class.cache_store.read(cache_key)
      expect(cached).to eq(body: '{"result":"success"}', status: 200)
    end

    it 'respects expires_in option' do
      controller.send(:write_cache, cache_key, response, 10.seconds)

      # Verify it was written with expiration
      expect(controller_class.cache_store.read(cache_key)).to be_present
    end

    it 'cache entry expires after expires_in duration' do
      # Write with 1 second expiration
      controller.send(:write_cache, cache_key, response, 1.second)

      # Should be present immediately
      expect(controller_class.cache_store.read(cache_key)).to be_present

      # Wait for expiration
      sleep(1.1)

      # Should be gone after expiration
      expect(controller_class.cache_store.read(cache_key)).to be_nil
    end

    it 'does not cache content_type' do
      controller.send(:write_cache, cache_key, response, 1.minute)

      cached = controller_class.cache_store.read(cache_key)
      expect(cached.keys).to contain_exactly(:body, :status)
    end
  end

  describe '#read_cache' do
    let(:cache_key) { 'views/example.org/web_api/v1/test.json' }
    let(:cached_data) { { body: '{"data":"cached"}', status: 200 } }

    before do
      controller_class.cache_store.write(cache_key, cached_data)
    end

    it 'reads from cache store' do
      result = controller.send(:read_cache, cache_key)
      expect(result).to eq(cached_data)
    end

    it 'returns nil for missing keys' do
      result = controller.send(:read_cache, 'nonexistent-key')
      expect(result).to be_nil
    end
  end

  describe '#render_cached_response' do
    let(:cached_response) { { body: '{"cached":"data"}', status: 304 } }

    it 'sets response body from cache' do
      controller.send(:render_cached_response, cached_response)
      expect(controller.response_body).to eq('{"cached":"data"}')
    end

    it 'sets response status from cache' do
      controller.send(:render_cached_response, cached_response)
      expect(controller.status).to eq(304)
    end

    it 'sets content_type to application/json' do
      controller.send(:render_cached_response, cached_response)
      expect(controller.content_type).to eq('application/json; charset=utf-8')
    end
  end

  describe '#cache_store' do
    it 'uses class cache_store' do
      expect(controller.send(:cache_store)).to eq(controller_class.cache_store)
    end

    it 'falls back to Rails.cache when class cache_store is nil' do
      controller_class.cache_store = nil
      allow(Rails).to receive(:cache).and_return(cache_store)

      expect(controller.send(:cache_store)).to eq(cache_store)
    end
  end

  describe '#action_has_layout=' do
    it 'provides compatibility shim' do
      expect { controller.action_has_layout = true }.not_to raise_error
    end

    it 'returns the value passed' do
      expect(controller.action_has_layout = :custom).to eq(:custom)
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
        include ActionCaching::Caching
      end

      # Count how many times ActionController::Caching appears
      count = klass.ancestors.count(ActionController::Caching)
      expect(count).to eq(1)
    end
  end
end
