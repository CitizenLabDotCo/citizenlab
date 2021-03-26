module SideFxHelper
  
  def clean_time_attributes hash
    hash.map do |_,v|
      if v.kind_of?(Time)
        [_ , v.to_i]
      elsif v.kind_of?(Date)
        [_ , v.to_time.to_i]
      else
        [_ , v]
      end
    end.to_h
  end

  # We can't pass a GlobalID of a deleted resource, since ActiveJob evaluates
  # and tries to find the record automatically. So we make our own version of
  # an encoded GlobalID to be used in case the resource is deleted
  def encode_frozen_resource r
    [r.class.name, r.id].join('/')
  end

  def decode_frozen_resource r
    class_name, id = r.split('/')
    [class_name.constantize, id]
  end
end