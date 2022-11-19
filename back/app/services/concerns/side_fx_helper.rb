# frozen_string_literal: true

module SideFxHelper
  def clean_time_attributes(hash)
    hash.to_h do |k, v|
      case v
      when Time
        [k, v.to_i]
      when Date
        [k, v.to_time.to_i]
      else
        [k, v]
      end
    end
  end

  # We can't pass a GlobalID of a deleted resource, since ActiveJob evaluates
  # and tries to find the record automatically. So we make our own version of
  # an encoded GlobalID to be used in case the resource is deleted
  def encode_frozen_resource(r)
    [r.class.name, r.id].join('/')
  end

  def decode_frozen_resource(r)
    class_name, id = r.split('/')
    [class_name.constantize, id]
  end
end
