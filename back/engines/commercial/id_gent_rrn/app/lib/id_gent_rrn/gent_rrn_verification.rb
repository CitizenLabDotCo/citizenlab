# frozen_string_literal: true

module IdGentRrn
  class GentRrnVerification
    include Verification::VerificationMethod

    def verification_method_type
      :manual_sync
    end

    def id
      "8a6d6f7e-a451-41ea-8e0a-0021439923a0"
    end

    def name
      "GentRrn"
    end

    def config_parameters
      [:api_key]
    end

    def verification_parameters
      [:rrn]
    end

    def verify_sync rrn:
      raise Verification::VerificationService::ParameterInvalidError.new("run") unless run_valid?(run)
      raise Verification::VerificationService::ParameterInvalidError.new("id_serial") unless id_serial_valid?(id_serial)

      GentRrn_valid_citizen!(run, id_serial)
    end

    private

    def GentRrn_valid_citizen! run, id_serial
      client = Savon.client(SHARED_SAVON_CONFIG.merge({
        wsse_auth: [config[:api_username], config[:api_password]]
      }))

      response = client.call(
        :get_data_document,
        message: {
          "typens:RUTEmpresa" => config[:rut_empresa],
          "typens:DVEmpresa" => 'k',
          "typens:CodTipoDocumento" => 'C',
          "typens:NumRUN" => clean_run(run),
          "typens:NumSerie" => clean_id_serial(id_serial),
        }
      )

      valid_response!(response.body[:get_data_document_response].slice(:ind_vigencia, :ind_bloqueo, :estado_respuesta))
      {
        uid: response.body[:get_data_document_response][:num_serie]
      }
    end

    # A transaction is successful if it meets one of the following rules:
    # 
    # 1:
    # Any person with IndVigencia = S can vote.
    # <type:IndVigencia>S</type:IndVigencia>
    # 
    # 2:
    # If IndVigencia is not in 'S', check other rules.  Here are the exceptions that allow you to vote:
    #     2.1
    #     <type:IndVigencia>N</type:IndVigencia>
    #     +
    #     <type:IndBloqueo>NO BLOQUEADO</type:IndBloqueo>
    #     2.2:
    #     <type:IndVigencia>N</type:IndVigencia>
    #     +
    #     <type:IndBloqueo>RENOVACION</type:IndBloqueo>
    #     2.3
    #     <type:IndVigencia>N</type:IndVigencia>
    #     +
    #     <type:IndBloqueo>TEMPORAL</type:IndBloqueo>
    # **Both IndVigencia and IndBloqueo conditions must be met.

    # For all other combinations that do not fit in these 4 alternatives, they must be blocked from voting.
    def valid_response! ind_vigencia: nil, ind_bloqueo: nil, estado_respuesta:
      if estado_respuesta != '000'
        raise Verification::VerificationService::NoMatchError.new
      elsif not(ind_vigencia == "S" || (ind_vigencia == "N" && ["NO BLOQUEADO", "RENOVACION", "TEMPORAL"].include?(ind_bloqueo)))
        raise Verification::VerificationService::NotEntitledError.new
      end
    end

    def run_valid? run
      run.present? && /^\d{1,2}\.\d{3}\.\d{3}[-][0-9kK]{1}$/.match?(run.strip)
    end

    def clean_run run
      run.strip.split('-').first.tr('^0-9', '')
    end

    def id_serial_valid? id_serial
      id_serial.strip.present?
    end

    def clean_id_serial id_serial
      id_serial.tr('^0-9a-zA-Z', '')
    end
  end
end