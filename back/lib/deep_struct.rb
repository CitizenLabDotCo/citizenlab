class DeepStruct
  def initialize(obj)

  end

  def convert
    case obj
    when Hash  then OpenStruct.new(obj.transform_values(&method(:convert)))
    when Array then obj.map(&method(:convert))
    else            obj
    end
  end
end
