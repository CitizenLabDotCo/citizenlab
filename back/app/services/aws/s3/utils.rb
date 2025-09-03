# frozen_string_literal: true

require 'parallel'

module Aws
  module S3
    class Utils
      # Returns an Enumerator that iterates over all the objects in an Amazon S3 bucket.
      # This method can handle any number of objects in the S3 bucket by automatically
      # paginating through results.
      #
      # @param [Aws::S3::Client] s3_client
      # @param [Hash] list_objects_v2_params Same parameters as Aws::S3::Client#list_objects_v2.
      def objects(s3_client, list_objects_v2_params)
        list_objects_responses(s3_client, list_objects_v2_params).flat_map(&:contents)
      end

      # Returns an array of top-level prefixes for (all or a subset of) objects in an S3
      # bucket.
      #
      # @param [Aws::S3::Client] s3_client
      # @param [Hash] list_objects_v2_params Same parameters as Aws::S3::Client#list_objects_v2.
      def common_prefixes(s3_client, list_objects_v2_params)
        list_objects_responses(s3_client, list_objects_v2_params).flat_map do |response|
          response.common_prefixes.map(&:prefix)
        end
      end

      # @param [String] source_bucket
      # @param [Aws::S3::Client] source_s3_client client configured with the region of the source bucket
      # @param [String] dest_bucket
      # @param [Aws::S3::Client] dest_s3_client client configured with the region of the destination bucket
      # @param [String] prefix
      # @param [Hash] copy_args Extra parameters forwarded to Aws::S3::Client#copy_object
      # @param [Integer] num_threads
      # @return [Hash{String => String}] Mapping of original keys to new keys
      def copy_objects(
        source_bucket,
        source_s3_client,
        dest_bucket,
        dest_s3_client: source_s3_client,
        prefix: '',
        copy_args: {},
        num_threads: 4
      )
        objects_enumerator = objects(source_s3_client, bucket: source_bucket, prefix: prefix)
        Parallel.map(objects_enumerator, in_threads: num_threads) do |object|
          key = object.key
          destination_key = yield key

          next unless destination_key

          # According to the AWS documentation, the copy_source parameter must be URL-encoded.
          copy_source = CGI.escape("#{source_bucket}/#{key}")

          dest_s3_client.copy_object(
            bucket: dest_bucket,
            copy_source: copy_source,
            key: destination_key,
            **copy_args
          )

          [key, destination_key]
        end.compact.to_h
      end

      # Deletes all objects in an S3 bucket with a specified prefix.
      #
      # @param [String] bucket
      # @param [Aws::S3::Client] s3_client
      # @param [String] prefix
      def delete_objects(
        bucket,
        s3_client,
        prefix: ''
      )
        list_objects_v2_params = { bucket: bucket, prefix: prefix }
        deleted_count = errors_count = 0

        loop do
          response = s3_client.list_objects_v2(list_objects_v2_params)
          break if response.contents.empty?

          objects_to_delete = response.contents.map { |object| { key: object.key } }

          delete_resp = s3_client.delete_objects(
            bucket: bucket,
            delete: { objects: objects_to_delete }
          )

          deleted_count += delete_resp.deleted.size
          errors_count += delete_resp.errors.size

          break unless response.is_truncated
        end

        { deleted_count: deleted_count, errors_count: errors_count }
      end

      private

      # Returns an enumerator that allows you to iterate over the responses returned by
      # the Aws::S3::Client#list_objects_v2 method. In other words, it simplifies the
      # process of paginating through the results.
      #
      # @param [Aws::S3::Client] s3_client
      # @param [Hash] list_objects_v2_params Same parameters as Aws::S3::Client#list_objects_v2.
      # @return [Enumerator<Seahorse::Client::Response>]
      def list_objects_responses(s3_client, list_objects_v2_params)
        Enumerator.new do |yielder|
          list_objects_request = list_objects_v2_params.dup

          loop do
            response = s3_client.list_objects_v2(list_objects_request)
            yielder.yield(response)

            break unless response.is_truncated

            list_objects_request[:continuation_token] = response.next_continuation_token
          end
        end
      end
    end
  end
end
