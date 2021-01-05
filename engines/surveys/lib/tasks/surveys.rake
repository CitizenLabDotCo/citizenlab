
namespace :surveys do

  def remove_params_from_uri url, param
    uri = URI.parse(url)
    query = uri.query
    params = Rack::Utils.parse_nested_query(query)
    params.delete(param)
    query = params.to_query
    uri.query = query
    uri.to_s
  end

  desc "Removes the `?email=` parameter from the survey_embed_url for typeform"
  task :remove_typeform_email_param => [:environment] do |t, args|
    Tenant.all.each do |tn|
      Apartment::Tenant.switch(tn.schema_name) do
        Project
          .where(participation_method: "survey", survey_service: "typeform")
          .where("survey_embed_url ILIKE ?", '%email=%')
          .each do |project|
            cleaned_url = remove_params_from_uri(project.survey_embed_url, "email")
            project.update_column(:survey_embed_url, cleaned_url)
          end
        Phase
          .where(participation_method: "survey", survey_service: "typeform")
          .where("survey_embed_url ILIKE ?", '%email=%')
          .each do |phase|
            cleaned_url = remove_params_from_uri(phase.survey_embed_url, "email")
            phase.update_column(:survey_embed_url, cleaned_url)
          end
      end
    end
  end

  desc "Update all webhooks for Typeform surveys"
  task :update_typeform_webhooks => [:environment] do

    Tenant.all.each do |tenant|
      Apartment::Tenant.switch(tenant.schema_name) do
        Rails.logger.info("processing tenant", tenant_id: tenant.id, tenant_host: tenant.host)
        Surveys::TypeformWebhookManager.new.update_all_webhooks
      end
    end
  end
end
