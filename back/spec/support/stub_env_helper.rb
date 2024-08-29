# frozen_string_literal: true

module StubEnvHelper
  # @overload stub_env(var_name, value)
  #  @param var_name [String] the name of the environment variable
  #  @param value [String] the value of the environment variable
  # @overload stub_env(hash)
  #  @param hash [Hash] a hash of environment variables and their values
  #
  # @example Stub a single environment variable
  #   stub_env('FOO', 'bar')
  # @example Stub multiple environment variables
  #   stub_env({'FOO' => 'bar', 'BAZ' => 'qux'})
  def stub_env(*args)
    allow(ENV).to receive(:[]).and_call_original
    allow(ENV).to receive(:fetch).and_call_original

    if args.size == 1 && args.first.respond_to?(:each_pair)
      args.first.each_pair do |var_name, value|
        stub_single_env(var_name, value)
      end
    elsif args.size == 2
      stub_single_env(args.first, args.second)
    else
      raise ArgumentError, 'Invalid arguments for stub_env'
    end
  end

  private

  def stub_single_env(var_name, value)
    var_name = var_name.to_s if var_name.is_a?(Symbol)
    allow(ENV).to receive(:[]).with(var_name).and_return(value)
    allow(ENV).to receive(:fetch).with(var_name).and_return(value)
  end
end
