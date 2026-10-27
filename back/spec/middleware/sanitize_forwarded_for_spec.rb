# frozen_string_literal: true

require 'rails_helper'
require 'middleware/sanitize_forwarded_for'

describe Middleware::SanitizeForwardedFor do
  subject(:middleware) { described_class.new(downstream) }

  let(:downstream) { ->(_env) { [200, {}, ['ok']] } }

  def env_after(headers)
    env = Rack::MockRequest.env_for('/', headers)
    middleware.call(env)
    env
  end

  it 'removes blank entries from X-Forwarded-For' do
    env = env_after('HTTP_X_FORWARDED_FOR' => '1.2.3.4, , 5.6.7.8')
    expect(env['HTTP_X_FORWARDED_FOR']).to eq('1.2.3.4, 5.6.7.8')
  end

  it 'deletes the header when only blank entries remain' do
    env = env_after('HTTP_X_FORWARDED_FOR' => ' , ,')
    expect(env).not_to have_key('HTTP_X_FORWARDED_FOR')
  end

  it 'leaves a well-formed header unchanged' do
    env = env_after('HTTP_X_FORWARDED_FOR' => '1.2.3.4, 5.6.7.8')
    expect(env['HTTP_X_FORWARDED_FOR']).to eq('1.2.3.4, 5.6.7.8')
  end

  it 'also sanitizes Client-Ip' do
    env = env_after('HTTP_CLIENT_IP' => ' , 9.9.9.9')
    expect(env['HTTP_CLIENT_IP']).to eq('9.9.9.9')
  end

  it 'is a no-op when the forwarded headers are absent' do
    expect { env_after({}) }.not_to raise_error
  end
end
