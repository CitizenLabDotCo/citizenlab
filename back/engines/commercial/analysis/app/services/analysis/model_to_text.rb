module Analysis
  class ModelToText
    def execute(instance, include_id: false, **_options)
      if include_id
        { 'ID' => instance.id }
      else
        {}
      end
    end

    def formatted(instance, **options)
      execute(instance, **options).map do |label, value|
        "### #{label}\n#{value}\n"
      end.join("\n")
    end
  end
end
