class ScriptReporter
  attr_reader :creates, :changes, :errors, :tenants

  def initialize
    @creates = []
    @changes = []
    @errors = []
    @tenants = []
  end

  def add_create(model_name, attributes, context: {})
    @creates << { model_name: model_name, attributes: attributes, context: context }
  end

  def add_change(old_value, new_value, context: {})
    @changes << { old_value: old_value, new_value: new_value, context: context }
  end

  def add_error(error, context: {})
    @errors << { error: error, context: context }
  end

  def add_processed_tenant(tenant)
    @tenants << tenant.host
  end

  def report!(filestr, verbose: false)
    if verbose
      Rails.logger.info "Processed tenants: #{tenants}"
      Rails.logger.info 'Creates:'
      creates.each do |create|
        Rails.logger.info "  #{create[:model_name]}: #{create[:attributes]} (#{create[:context].map { |k, v| "#{k}: #{v}" }.join(', ')})"
      end
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

    File.write(filestr, JSON.pretty_generate(processed_tenants: tenants, creates: creates, changes: changes, errors: errors))
  end
end
