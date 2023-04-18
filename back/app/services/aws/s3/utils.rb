# frozen_string_literal: true

require 'parallel'

module Aws
  module S3
    class Utils
      # @param [Aws::S3::Client] s3_client
      def initialize(s3_client)
        @s3_client = s3_client
      end

      # Returns an Enumerator that iterates over all the objects in an Amazon S3 bucket.
      # This method can handle any number of objects in the S3 bucket by automatically
      # paginating through results.
      #
      # @param [Hash] list_objects_v2_params Same parameters as Aws::S3::Client#list_objects_v2.
      def objects(list_objects_v2_params)
        list_objects_responses(list_objects_v2_params).flat_map(&:contents)
      end

      # Returns an array of top-level prefixes for (all or a subset of) objects in an S3
      # bucket.
      #
      # @param [Hash] list_objects_v2_params Same parameters as Aws::S3::Client#list_objects_v2.
      def common_prefixes(list_objects_v2_params)
        list_objects_responses(list_objects_v2_params).flat_map do |response|
          response.common_prefixes.map(&:prefix)
        end
      end

      # @param [String] from_bucket
      # @param [String] to_bucket
      # @param [String] prefix
      # @param [Hash] copy_args Extra parameters forwarded to Aws::S3::Client#copy_object
      # @param [Integer] num_threads
      # @return [Hash{String => String}] Mapping of original keys to new keys
      def copy_objects(from_bucket, to_bucket, prefix, copy_args: {}, num_threads: 4)
        Parallel.map(objects(bucket: from_bucket, prefix: prefix), in_threads: num_threads) do |object|
          key = object.key
          destination_key = yield key

          next unless destination_key

          copy_source = "#{from_bucket}/#{key}"

          @s3_client.copy_object(
            bucket: to_bucket,
            copy_source: copy_source,
            key: destination_key,
            **copy_args
          )

          [key, destination_key]
        end.compact.to_h
      end

      private

      # Returns an enumerator that allows you to iterate over the responses returned by
      # the Aws::S3::Client#list_objects_v2 method. In other words, it simplifies the
      # process of paginating through the results.
      #
      # @param [Hash] list_objects_v2_params Same parameters as Aws::S3::Client#list_objects_v2.
      # @return [Enumerator<Seahorse::Client::Response>]
      def list_objects_responses(list_objects_v2_params)
        Enumerator.new do |yielder|
          list_objects_request = list_objects_v2_params.dup

          loop do
            response = @s3_client.list_objects_v2(list_objects_request)
            yielder.yield(response)

            break unless response.is_truncated

            list_objects_request[:continuation_token] = response.next_continuation_token
          end
        end
      end
    end
  end
end
