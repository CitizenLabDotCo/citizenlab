class ScriptReporter
  attr_reader :changes, :errors

  def initialize
    @changes = []
    @errors = []
  end

  def add_change(old_value, new_value, context: {})
    @changes << { old_value: old_value, new_value: new_value, context: context }
  end

  def add_error(error, context: {})
    @errors << { error: error, context: context }
  end

  def report!(filestr, verbose: false)
    if verbose
      Rails.logger.info 'Changes:'
      changes.each do |change|
        Rails.logger.info "  #{change[:old_value]} => #{change[:new_value]} (#{change[:context].map { |k, v| "#{k}: #{v}" }.join(', ')})"
      end
      if errors.present?
        Rails.logger.error 'Errors:'
        errors.each do |error|
          Rails.logger.error "  #{error[:error]} (#{error[:context].map { |k, v| "#{k}: #{v}" }.join(', ')})"
        end
      else
        Rails.logger.info 'No errors.'
      end
    end

    File.write(filestr, JSON.pretty_generate(changes: changes, errors: errors))
  end
end
