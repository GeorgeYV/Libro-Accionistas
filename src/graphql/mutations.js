/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createAumentoCapital = /* GraphQL */ `
  mutation CreateAumentoCapital(
    $input: CreateAumentoCapitalInput!
    $condition: ModelAumentoCapitalConditionInput
  ) {
    createAumentoCapital(input: $input, condition: $condition) {
      id
      aum_cap_valor_nominal
      aum_cap_capital
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateAumentoCapital = /* GraphQL */ `
  mutation UpdateAumentoCapital(
    $input: UpdateAumentoCapitalInput!
    $condition: ModelAumentoCapitalConditionInput
  ) {
    updateAumentoCapital(input: $input, condition: $condition) {
      id
      aum_cap_valor_nominal
      aum_cap_capital
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteAumentoCapital = /* GraphQL */ `
  mutation DeleteAumentoCapital(
    $input: DeleteAumentoCapitalInput!
    $condition: ModelAumentoCapitalConditionInput
  ) {
    deleteAumentoCapital(input: $input, condition: $condition) {
      id
      aum_cap_valor_nominal
      aum_cap_capital
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const createAccionistaOperacion = /* GraphQL */ `
  mutation CreateAccionistaOperacion(
    $input: CreateAccionistaOperacionInput!
    $condition: ModelAccionistaOperacionConditionInput
  ) {
    createAccionistaOperacion(input: $input, condition: $condition) {
      id
      acc_ope_detalle
      acc_ope_operacion_id
      acc_ope_accionista_id
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateAccionistaOperacion = /* GraphQL */ `
  mutation UpdateAccionistaOperacion(
    $input: UpdateAccionistaOperacionInput!
    $condition: ModelAccionistaOperacionConditionInput
  ) {
    updateAccionistaOperacion(input: $input, condition: $condition) {
      id
      acc_ope_detalle
      acc_ope_operacion_id
      acc_ope_accionista_id
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteAccionistaOperacion = /* GraphQL */ `
  mutation DeleteAccionistaOperacion(
    $input: DeleteAccionistaOperacionInput!
    $condition: ModelAccionistaOperacionConditionInput
  ) {
    deleteAccionistaOperacion(input: $input, condition: $condition) {
      id
      acc_ope_detalle
      acc_ope_operacion_id
      acc_ope_accionista_id
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const createTituloPorOperacion = /* GraphQL */ `
  mutation CreateTituloPorOperacion(
    $input: CreateTituloPorOperacionInput!
    $condition: ModelTituloPorOperacionConditionInput
  ) {
    createTituloPorOperacion(input: $input, condition: $condition) {
      id
      tit_ope_acciones
      tit_ope_titulo_id
      tit_ope_operacion_id
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateTituloPorOperacion = /* GraphQL */ `
  mutation UpdateTituloPorOperacion(
    $input: UpdateTituloPorOperacionInput!
    $condition: ModelTituloPorOperacionConditionInput
  ) {
    updateTituloPorOperacion(input: $input, condition: $condition) {
      id
      tit_ope_acciones
      tit_ope_titulo_id
      tit_ope_operacion_id
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteTituloPorOperacion = /* GraphQL */ `
  mutation DeleteTituloPorOperacion(
    $input: DeleteTituloPorOperacionInput!
    $condition: ModelTituloPorOperacionConditionInput
  ) {
    deleteTituloPorOperacion(input: $input, condition: $condition) {
      id
      tit_ope_acciones
      tit_ope_titulo_id
      tit_ope_operacion_id
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const createOperacion = /* GraphQL */ `
  mutation CreateOperacion(
    $input: CreateOperacionInput!
    $condition: ModelOperacionConditionInput
  ) {
    createOperacion(input: $input, condition: $condition) {
      id
      ope_fecha
      ope_tipo
      ope_acciones
      ope_estado
      ope_ingresador
      ope_aprobador
      ope_fecha_aprobacion
      ope_motivo_rechazo
      ope_observacion
      ope_documento
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateOperacion = /* GraphQL */ `
  mutation UpdateOperacion(
    $input: UpdateOperacionInput!
    $condition: ModelOperacionConditionInput
  ) {
    updateOperacion(input: $input, condition: $condition) {
      id
      ope_fecha
      ope_tipo
      ope_acciones
      ope_estado
      ope_ingresador
      ope_aprobador
      ope_fecha_aprobacion
      ope_motivo_rechazo
      ope_observacion
      ope_documento
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteOperacion = /* GraphQL */ `
  mutation DeleteOperacion(
    $input: DeleteOperacionInput!
    $condition: ModelOperacionConditionInput
  ) {
    deleteOperacion(input: $input, condition: $condition) {
      id
      ope_fecha
      ope_tipo
      ope_acciones
      ope_estado
      ope_ingresador
      ope_aprobador
      ope_fecha_aprobacion
      ope_motivo_rechazo
      ope_observacion
      ope_documento
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const createTitulo = /* GraphQL */ `
  mutation CreateTitulo(
    $input: CreateTituloInput!
    $condition: ModelTituloConditionInput
  ) {
    createTitulo(input: $input, condition: $condition) {
      id
      tit_acciones
      tit_estado
      tit_desde
      tit_hasta
      tit_padre
      tit_nivel
      tit_accionista_id
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateTitulo = /* GraphQL */ `
  mutation UpdateTitulo(
    $input: UpdateTituloInput!
    $condition: ModelTituloConditionInput
  ) {
    updateTitulo(input: $input, condition: $condition) {
      id
      tit_acciones
      tit_estado
      tit_desde
      tit_hasta
      tit_padre
      tit_nivel
      tit_accionista_id
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteTitulo = /* GraphQL */ `
  mutation DeleteTitulo(
    $input: DeleteTituloInput!
    $condition: ModelTituloConditionInput
  ) {
    deleteTitulo(input: $input, condition: $condition) {
      id
      tit_acciones
      tit_estado
      tit_desde
      tit_hasta
      tit_padre
      tit_nivel
      tit_accionista_id
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const createPersonaNatural = /* GraphQL */ `
  mutation CreatePersonaNatural(
    $input: CreatePersonaNaturalInput!
    $condition: ModelPersonaNaturalConditionInput
  ) {
    createPersonaNatural(input: $input, condition: $condition) {
      id
      pn_primer_nombre
      pn_segundo_nombre
      pn_apellido_paterno
      pn_apellido_materno
      pn_estado_civil
      pn_doc_identificacion
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updatePersonaNatural = /* GraphQL */ `
  mutation UpdatePersonaNatural(
    $input: UpdatePersonaNaturalInput!
    $condition: ModelPersonaNaturalConditionInput
  ) {
    updatePersonaNatural(input: $input, condition: $condition) {
      id
      pn_primer_nombre
      pn_segundo_nombre
      pn_apellido_paterno
      pn_apellido_materno
      pn_estado_civil
      pn_doc_identificacion
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deletePersonaNatural = /* GraphQL */ `
  mutation DeletePersonaNatural(
    $input: DeletePersonaNaturalInput!
    $condition: ModelPersonaNaturalConditionInput
  ) {
    deletePersonaNatural(input: $input, condition: $condition) {
      id
      pn_primer_nombre
      pn_segundo_nombre
      pn_apellido_paterno
      pn_apellido_materno
      pn_estado_civil
      pn_doc_identificacion
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const createPersonaJuridica = /* GraphQL */ `
  mutation CreatePersonaJuridica(
    $input: CreatePersonaJuridicaInput!
    $condition: ModelPersonaJuridicaConditionInput
  ) {
    createPersonaJuridica(input: $input, condition: $condition) {
      id
      pj_rl_tipo_identificacion
      pj_razon_social
      pj_rl_identificacion
      pj_rl_nombre
      pj_rl_nacionalidad
      pj_rl_telefono
      pj_rl_email
      pj_doc_nombramiento
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updatePersonaJuridica = /* GraphQL */ `
  mutation UpdatePersonaJuridica(
    $input: UpdatePersonaJuridicaInput!
    $condition: ModelPersonaJuridicaConditionInput
  ) {
    updatePersonaJuridica(input: $input, condition: $condition) {
      id
      pj_rl_tipo_identificacion
      pj_razon_social
      pj_rl_identificacion
      pj_rl_nombre
      pj_rl_nacionalidad
      pj_rl_telefono
      pj_rl_email
      pj_doc_nombramiento
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deletePersonaJuridica = /* GraphQL */ `
  mutation DeletePersonaJuridica(
    $input: DeletePersonaJuridicaInput!
    $condition: ModelPersonaJuridicaConditionInput
  ) {
    deletePersonaJuridica(input: $input, condition: $condition) {
      id
      pj_rl_tipo_identificacion
      pj_razon_social
      pj_rl_identificacion
      pj_rl_nombre
      pj_rl_nacionalidad
      pj_rl_telefono
      pj_rl_email
      pj_doc_nombramiento
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const createConyuge = /* GraphQL */ `
  mutation CreateConyuge(
    $input: CreateConyugeInput!
    $condition: ModelConyugeConditionInput
  ) {
    createConyuge(input: $input, condition: $condition) {
      id
      con_tipo_identificacion
      con_identificacion
      con_nombre
      con_nacionalidad
      con_doc_identifcacion
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateConyuge = /* GraphQL */ `
  mutation UpdateConyuge(
    $input: UpdateConyugeInput!
    $condition: ModelConyugeConditionInput
  ) {
    updateConyuge(input: $input, condition: $condition) {
      id
      con_tipo_identificacion
      con_identificacion
      con_nombre
      con_nacionalidad
      con_doc_identifcacion
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteConyuge = /* GraphQL */ `
  mutation DeleteConyuge(
    $input: DeleteConyugeInput!
    $condition: ModelConyugeConditionInput
  ) {
    deleteConyuge(input: $input, condition: $condition) {
      id
      con_tipo_identificacion
      con_identificacion
      con_nombre
      con_nacionalidad
      con_doc_identifcacion
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const createDividendosTitulos = /* GraphQL */ `
  mutation CreateDividendosTitulos(
    $input: CreateDividendosTitulosInput!
    $condition: ModelDividendosTitulosConditionInput
  ) {
    createDividendosTitulos(input: $input, condition: $condition) {
      id
      div_tit_participacion
      div_tit_dividendo
      div_tit_retencion
      div_tit_base_imponible
      div_tit_fecha_pago
      div_tit_documento
      div_tit_ddiv_id
      div_tit_titulo_id
      div_tit_accionista_id
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateDividendosTitulos = /* GraphQL */ `
  mutation UpdateDividendosTitulos(
    $input: UpdateDividendosTitulosInput!
    $condition: ModelDividendosTitulosConditionInput
  ) {
    updateDividendosTitulos(input: $input, condition: $condition) {
      id
      div_tit_participacion
      div_tit_dividendo
      div_tit_retencion
      div_tit_base_imponible
      div_tit_fecha_pago
      div_tit_documento
      div_tit_ddiv_id
      div_tit_titulo_id
      div_tit_accionista_id
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteDividendosTitulos = /* GraphQL */ `
  mutation DeleteDividendosTitulos(
    $input: DeleteDividendosTitulosInput!
    $condition: ModelDividendosTitulosConditionInput
  ) {
    deleteDividendosTitulos(input: $input, condition: $condition) {
      id
      div_tit_participacion
      div_tit_dividendo
      div_tit_retencion
      div_tit_base_imponible
      div_tit_fecha_pago
      div_tit_documento
      div_tit_ddiv_id
      div_tit_titulo_id
      div_tit_accionista_id
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const createDetalleDividendo = /* GraphQL */ `
  mutation CreateDetalleDividendo(
    $input: CreateDetalleDividendoInput!
    $condition: ModelDetalleDividendoConditionInput
  ) {
    createDetalleDividendo(input: $input, condition: $condition) {
      id
      ddiv_usuario
      ddiv_secuencial
      ddiv_fecha_junta
      ddiv_fecha_pago
      ddiv_titulos
      ddiv_dividendo
      ddiv_porcentaje
      ddiv_dividendo_id
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateDetalleDividendo = /* GraphQL */ `
  mutation UpdateDetalleDividendo(
    $input: UpdateDetalleDividendoInput!
    $condition: ModelDetalleDividendoConditionInput
  ) {
    updateDetalleDividendo(input: $input, condition: $condition) {
      id
      ddiv_usuario
      ddiv_secuencial
      ddiv_fecha_junta
      ddiv_fecha_pago
      ddiv_titulos
      ddiv_dividendo
      ddiv_porcentaje
      ddiv_dividendo_id
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteDetalleDividendo = /* GraphQL */ `
  mutation DeleteDetalleDividendo(
    $input: DeleteDetalleDividendoInput!
    $condition: ModelDetalleDividendoConditionInput
  ) {
    deleteDetalleDividendo(input: $input, condition: $condition) {
      id
      ddiv_usuario
      ddiv_secuencial
      ddiv_fecha_junta
      ddiv_fecha_pago
      ddiv_titulos
      ddiv_dividendo
      ddiv_porcentaje
      ddiv_dividendo_id
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const createDividendoNuevo = /* GraphQL */ `
  mutation CreateDividendoNuevo(
    $input: CreateDividendoNuevoInput!
    $condition: ModelDividendoNuevoConditionInput
  ) {
    createDividendoNuevo(input: $input, condition: $condition) {
      id
      div_periodo
      div_concepto
      div_dividendo
      div_repartido
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateDividendoNuevo = /* GraphQL */ `
  mutation UpdateDividendoNuevo(
    $input: UpdateDividendoNuevoInput!
    $condition: ModelDividendoNuevoConditionInput
  ) {
    updateDividendoNuevo(input: $input, condition: $condition) {
      id
      div_periodo
      div_concepto
      div_dividendo
      div_repartido
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteDividendoNuevo = /* GraphQL */ `
  mutation DeleteDividendoNuevo(
    $input: DeleteDividendoNuevoInput!
    $condition: ModelDividendoNuevoConditionInput
  ) {
    deleteDividendoNuevo(input: $input, condition: $condition) {
      id
      div_periodo
      div_concepto
      div_dividendo
      div_repartido
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const createPais = /* GraphQL */ `
  mutation CreatePais(
    $input: CreatePaisInput!
    $condition: ModelPaisConditionInput
  ) {
    createPais(input: $input, condition: $condition) {
      id
      nombre
      nombreCorto
      nacionalidad
      codigoTelefono
      estado
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updatePais = /* GraphQL */ `
  mutation UpdatePais(
    $input: UpdatePaisInput!
    $condition: ModelPaisConditionInput
  ) {
    updatePais(input: $input, condition: $condition) {
      id
      nombre
      nombreCorto
      nacionalidad
      codigoTelefono
      estado
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deletePais = /* GraphQL */ `
  mutation DeletePais(
    $input: DeletePaisInput!
    $condition: ModelPaisConditionInput
  ) {
    deletePais(input: $input, condition: $condition) {
      id
      nombre
      nombreCorto
      nacionalidad
      codigoTelefono
      estado
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const createProvincia = /* GraphQL */ `
  mutation CreateProvincia(
    $input: CreateProvinciaInput!
    $condition: ModelProvinciaConditionInput
  ) {
    createProvincia(input: $input, condition: $condition) {
      id
      nombre
      Pais
      estado
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateProvincia = /* GraphQL */ `
  mutation UpdateProvincia(
    $input: UpdateProvinciaInput!
    $condition: ModelProvinciaConditionInput
  ) {
    updateProvincia(input: $input, condition: $condition) {
      id
      nombre
      Pais
      estado
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteProvincia = /* GraphQL */ `
  mutation DeleteProvincia(
    $input: DeleteProvinciaInput!
    $condition: ModelProvinciaConditionInput
  ) {
    deleteProvincia(input: $input, condition: $condition) {
      id
      nombre
      Pais
      estado
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const createCiudad = /* GraphQL */ `
  mutation CreateCiudad(
    $input: CreateCiudadInput!
    $condition: ModelCiudadConditionInput
  ) {
    createCiudad(input: $input, condition: $condition) {
      id
      nombre
      Provincia
      estado
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateCiudad = /* GraphQL */ `
  mutation UpdateCiudad(
    $input: UpdateCiudadInput!
    $condition: ModelCiudadConditionInput
  ) {
    updateCiudad(input: $input, condition: $condition) {
      id
      nombre
      Provincia
      estado
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteCiudad = /* GraphQL */ `
  mutation DeleteCiudad(
    $input: DeleteCiudadInput!
    $condition: ModelCiudadConditionInput
  ) {
    deleteCiudad(input: $input, condition: $condition) {
      id
      nombre
      Provincia
      estado
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const createAccionista = /* GraphQL */ `
  mutation CreateAccionista(
    $input: CreateAccionistaInput!
    $condition: ModelAccionistaConditionInput
  ) {
    createAccionista(input: $input, condition: $condition) {
      id
      acc_decevale
      acc_estado
      acc_tipo_identificacion
      acc_identificacion
      acc_nacionalidad
      acc_residencia
      acc_pais
      acc_provincia
      acc_ciudad
      acc_direccion
      acc_dir_numero
      acc_banco
      acc_tipo_cuenta
      acc_cuenta_bancaria
      acc_doc_certificado_bancario
      acc_doc_actualizacion_datos
      acc_doc_uso_datos
      acc_doc_posesion_efectiva
      acc_telefonos
      acc_obs_telefonos
      acc_correos
      acc_cantidad_acciones
      acc_participacion
      acc_tipo_acciones
      acc_tipo_persona
      acc_nombre_completo
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateAccionista = /* GraphQL */ `
  mutation UpdateAccionista(
    $input: UpdateAccionistaInput!
    $condition: ModelAccionistaConditionInput
  ) {
    updateAccionista(input: $input, condition: $condition) {
      id
      acc_decevale
      acc_estado
      acc_tipo_identificacion
      acc_identificacion
      acc_nacionalidad
      acc_residencia
      acc_pais
      acc_provincia
      acc_ciudad
      acc_direccion
      acc_dir_numero
      acc_banco
      acc_tipo_cuenta
      acc_cuenta_bancaria
      acc_doc_certificado_bancario
      acc_doc_actualizacion_datos
      acc_doc_uso_datos
      acc_doc_posesion_efectiva
      acc_telefonos
      acc_obs_telefonos
      acc_correos
      acc_cantidad_acciones
      acc_participacion
      acc_tipo_acciones
      acc_tipo_persona
      acc_nombre_completo
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteAccionista = /* GraphQL */ `
  mutation DeleteAccionista(
    $input: DeleteAccionistaInput!
    $condition: ModelAccionistaConditionInput
  ) {
    deleteAccionista(input: $input, condition: $condition) {
      id
      acc_decevale
      acc_estado
      acc_tipo_identificacion
      acc_identificacion
      acc_nacionalidad
      acc_residencia
      acc_pais
      acc_provincia
      acc_ciudad
      acc_direccion
      acc_dir_numero
      acc_banco
      acc_tipo_cuenta
      acc_cuenta_bancaria
      acc_doc_certificado_bancario
      acc_doc_actualizacion_datos
      acc_doc_uso_datos
      acc_doc_posesion_efectiva
      acc_telefonos
      acc_obs_telefonos
      acc_correos
      acc_cantidad_acciones
      acc_participacion
      acc_tipo_acciones
      acc_tipo_persona
      acc_nombre_completo
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const createHeredero = /* GraphQL */ `
  mutation CreateHeredero(
    $input: CreateHerederoInput!
    $condition: ModelHerederoConditionInput
  ) {
    createHeredero(input: $input, condition: $condition) {
      id
      accionistaHerederoId
      nombre
      cantidad
      idCedente
      nombreCedente
      estado
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateHeredero = /* GraphQL */ `
  mutation UpdateHeredero(
    $input: UpdateHerederoInput!
    $condition: ModelHerederoConditionInput
  ) {
    updateHeredero(input: $input, condition: $condition) {
      id
      accionistaHerederoId
      nombre
      cantidad
      idCedente
      nombreCedente
      estado
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteHeredero = /* GraphQL */ `
  mutation DeleteHeredero(
    $input: DeleteHerederoInput!
    $condition: ModelHerederoConditionInput
  ) {
    deleteHeredero(input: $input, condition: $condition) {
      id
      accionistaHerederoId
      nombre
      cantidad
      idCedente
      nombreCedente
      estado
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const createParametro = /* GraphQL */ `
  mutation CreateParametro(
    $input: CreateParametroInput!
    $condition: ModelParametroConditionInput
  ) {
    createParametro(input: $input, condition: $condition) {
      id
      moneda
      cantidadEmitida
      valorNominal
      baseImponible
      noResidente
      IGdesde1
      IGhasta1
      FBretencion1
      FEretencion1
      IGdesde2
      IGhasta2
      FBretencion2
      FEretencion2
      IGdesde3
      IGhasta3
      FBretencion3
      FEretencion3
      IGdesde4
      IGhasta4
      FBretencion4
      FEretencion4
      IGdesde5
      IGhasta5
      FBretencion5
      FEretencion5
      IGdesde6
      IGhasta6
      FBretencion6
      FEretencion6
      Retencion_Minima
      Retencion_Maxima
      Retencion_PN_Loc
      Retencion_PN_NPF
      Retencion_PN_PF
      Retencion_PJ_Loc_Loc
      Retencion_PJ_Loc_NPF
      Retencion_PJ_Loc_PF
      Retencion_PJ_PF_Loc
      Retencion_PJ_PF_NPF
      Retencion_PJ_PF_PF
      Retencion_PJ_NPF_Loc
      Retencion_PJ_NPF_NPF
      Retencion_PJ_NPF_PF
      modeloCartaCesion
      modeloCartaGerente
      modeloCartaInstrucciones
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateParametro = /* GraphQL */ `
  mutation UpdateParametro(
    $input: UpdateParametroInput!
    $condition: ModelParametroConditionInput
  ) {
    updateParametro(input: $input, condition: $condition) {
      id
      moneda
      cantidadEmitida
      valorNominal
      baseImponible
      noResidente
      IGdesde1
      IGhasta1
      FBretencion1
      FEretencion1
      IGdesde2
      IGhasta2
      FBretencion2
      FEretencion2
      IGdesde3
      IGhasta3
      FBretencion3
      FEretencion3
      IGdesde4
      IGhasta4
      FBretencion4
      FEretencion4
      IGdesde5
      IGhasta5
      FBretencion5
      FEretencion5
      IGdesde6
      IGhasta6
      FBretencion6
      FEretencion6
      Retencion_Minima
      Retencion_Maxima
      Retencion_PN_Loc
      Retencion_PN_NPF
      Retencion_PN_PF
      Retencion_PJ_Loc_Loc
      Retencion_PJ_Loc_NPF
      Retencion_PJ_Loc_PF
      Retencion_PJ_PF_Loc
      Retencion_PJ_PF_NPF
      Retencion_PJ_PF_PF
      Retencion_PJ_NPF_Loc
      Retencion_PJ_NPF_NPF
      Retencion_PJ_NPF_PF
      modeloCartaCesion
      modeloCartaGerente
      modeloCartaInstrucciones
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteParametro = /* GraphQL */ `
  mutation DeleteParametro(
    $input: DeleteParametroInput!
    $condition: ModelParametroConditionInput
  ) {
    deleteParametro(input: $input, condition: $condition) {
      id
      moneda
      cantidadEmitida
      valorNominal
      baseImponible
      noResidente
      IGdesde1
      IGhasta1
      FBretencion1
      FEretencion1
      IGdesde2
      IGhasta2
      FBretencion2
      FEretencion2
      IGdesde3
      IGhasta3
      FBretencion3
      FEretencion3
      IGdesde4
      IGhasta4
      FBretencion4
      FEretencion4
      IGdesde5
      IGhasta5
      FBretencion5
      FEretencion5
      IGdesde6
      IGhasta6
      FBretencion6
      FEretencion6
      Retencion_Minima
      Retencion_Maxima
      Retencion_PN_Loc
      Retencion_PN_NPF
      Retencion_PN_PF
      Retencion_PJ_Loc_Loc
      Retencion_PJ_Loc_NPF
      Retencion_PJ_Loc_PF
      Retencion_PJ_PF_Loc
      Retencion_PJ_PF_NPF
      Retencion_PJ_PF_PF
      Retencion_PJ_NPF_Loc
      Retencion_PJ_NPF_NPF
      Retencion_PJ_NPF_PF
      modeloCartaCesion
      modeloCartaGerente
      modeloCartaInstrucciones
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const createParametroArchive = /* GraphQL */ `
  mutation CreateParametroArchive(
    $input: CreateParametroArchiveInput!
    $condition: ModelParametroArchiveConditionInput
  ) {
    createParametroArchive(input: $input, condition: $condition) {
      id
      fecha
      moneda
      cantidadEmitida
      valorNominal
      baseImponible
      noResidente
      IGdesde1
      IGhasta1
      FBretencion1
      FEretencion1
      IGdesde2
      IGhasta2
      FBretencion2
      FEretencion2
      IGdesde3
      IGhasta3
      FBretencion3
      FEretencion3
      IGdesde4
      IGhasta4
      FBretencion4
      FEretencion4
      IGdesde5
      IGhasta5
      FBretencion5
      FEretencion5
      IGdesde6
      IGhasta6
      FBretencion6
      FEretencion6
      Retencion_Minima
      Retencion_Maxima
      Retencion_PN_Loc
      Retencion_PN_NPF
      Retencion_PN_PF
      Retencion_PJ_Loc_Loc
      Retencion_PJ_Loc_NPF
      Retencion_PJ_Loc_PF
      Retencion_PJ_PF_Loc
      Retencion_PJ_PF_NPF
      Retencion_PJ_PF_PF
      Retencion_PJ_NPF_Loc
      Retencion_PJ_NPF_NPF
      Retencion_PJ_NPF_PF
      modeloCartaCesion
      modeloCartaGerente
      modeloCartaInstrucciones
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateParametroArchive = /* GraphQL */ `
  mutation UpdateParametroArchive(
    $input: UpdateParametroArchiveInput!
    $condition: ModelParametroArchiveConditionInput
  ) {
    updateParametroArchive(input: $input, condition: $condition) {
      id
      fecha
      moneda
      cantidadEmitida
      valorNominal
      baseImponible
      noResidente
      IGdesde1
      IGhasta1
      FBretencion1
      FEretencion1
      IGdesde2
      IGhasta2
      FBretencion2
      FEretencion2
      IGdesde3
      IGhasta3
      FBretencion3
      FEretencion3
      IGdesde4
      IGhasta4
      FBretencion4
      FEretencion4
      IGdesde5
      IGhasta5
      FBretencion5
      FEretencion5
      IGdesde6
      IGhasta6
      FBretencion6
      FEretencion6
      Retencion_Minima
      Retencion_Maxima
      Retencion_PN_Loc
      Retencion_PN_NPF
      Retencion_PN_PF
      Retencion_PJ_Loc_Loc
      Retencion_PJ_Loc_NPF
      Retencion_PJ_Loc_PF
      Retencion_PJ_PF_Loc
      Retencion_PJ_PF_NPF
      Retencion_PJ_PF_PF
      Retencion_PJ_NPF_Loc
      Retencion_PJ_NPF_NPF
      Retencion_PJ_NPF_PF
      modeloCartaCesion
      modeloCartaGerente
      modeloCartaInstrucciones
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteParametroArchive = /* GraphQL */ `
  mutation DeleteParametroArchive(
    $input: DeleteParametroArchiveInput!
    $condition: ModelParametroArchiveConditionInput
  ) {
    deleteParametroArchive(input: $input, condition: $condition) {
      id
      fecha
      moneda
      cantidadEmitida
      valorNominal
      baseImponible
      noResidente
      IGdesde1
      IGhasta1
      FBretencion1
      FEretencion1
      IGdesde2
      IGhasta2
      FBretencion2
      FEretencion2
      IGdesde3
      IGhasta3
      FBretencion3
      FEretencion3
      IGdesde4
      IGhasta4
      FBretencion4
      FEretencion4
      IGdesde5
      IGhasta5
      FBretencion5
      FEretencion5
      IGdesde6
      IGhasta6
      FBretencion6
      FEretencion6
      Retencion_Minima
      Retencion_Maxima
      Retencion_PN_Loc
      Retencion_PN_NPF
      Retencion_PN_PF
      Retencion_PJ_Loc_Loc
      Retencion_PJ_Loc_NPF
      Retencion_PJ_Loc_PF
      Retencion_PJ_PF_Loc
      Retencion_PJ_PF_NPF
      Retencion_PJ_PF_PF
      Retencion_PJ_NPF_Loc
      Retencion_PJ_NPF_NPF
      Retencion_PJ_NPF_PF
      modeloCartaCesion
      modeloCartaGerente
      modeloCartaInstrucciones
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const createAsamblea = /* GraphQL */ `
  mutation CreateAsamblea(
    $input: CreateAsambleaInput!
    $condition: ModelAsambleaConditionInput
  ) {
    createAsamblea(input: $input, condition: $condition) {
      id
      tipo
      fecha
      hora
      junta
      lugar
      link
      ordenDia
      estado
      email
      registrados
      quorum
      acciones
      participacion
      capital
      acta
      votaciones
      horaAperturaQuorum
      horaCierreQuorum
      cierreQuorum
      presentes
      presentesCapital
      presentesPorcentajePersona
      presentesPorcentajeCapital
      ausentes
      ausentesCapital
      ausentesPorcentajePersona
      ausentesPorcentajeCapital
      representados
      representadosCapital
      representadosPorcentajePersona
      representadosPorcentajeCapital
      totalpresentes
      totalcapitalpresentes
      totalporcentajePersona
      totalporcentajeCapital
      votacionTema1
      votacionTema2
      votacionTema3
      votacionTema4
      votacionTema5
      votacionTema6
      votacionTema7
      votacionTema8
      votacionTema9
      votacionTema10
      votacionTema11
      votacionTema12
      votacionTema13
      votacionTema14
      votacionTema15
      votacionResultado1
      votacionResultado2
      votacionResultado3
      votacionResultado4
      votacionResultado5
      votacionResultado6
      votacionResultado7
      votacionResultado8
      votacionResultado9
      votacionResultado10
      votacionResultado11
      votacionResultado12
      votacionResultado13
      votacionResultado14
      votacionResultado15
      habilitanteTema1
      habilitanteTema2
      habilitanteTema3
      habilitanteTema4
      habilitanteTema5
      habilitanteTema6
      habilitanteTema7
      habilitanteTema8
      habilitanteTema9
      habilitanteTema10
      habilitanteTema11
      habilitanteTema12
      habilitanteTema13
      habilitanteTema14
      habilitanteTema15
      rutaGrabacion
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateAsamblea = /* GraphQL */ `
  mutation UpdateAsamblea(
    $input: UpdateAsambleaInput!
    $condition: ModelAsambleaConditionInput
  ) {
    updateAsamblea(input: $input, condition: $condition) {
      id
      tipo
      fecha
      hora
      junta
      lugar
      link
      ordenDia
      estado
      email
      registrados
      quorum
      acciones
      participacion
      capital
      acta
      votaciones
      horaAperturaQuorum
      horaCierreQuorum
      cierreQuorum
      presentes
      presentesCapital
      presentesPorcentajePersona
      presentesPorcentajeCapital
      ausentes
      ausentesCapital
      ausentesPorcentajePersona
      ausentesPorcentajeCapital
      representados
      representadosCapital
      representadosPorcentajePersona
      representadosPorcentajeCapital
      totalpresentes
      totalcapitalpresentes
      totalporcentajePersona
      totalporcentajeCapital
      votacionTema1
      votacionTema2
      votacionTema3
      votacionTema4
      votacionTema5
      votacionTema6
      votacionTema7
      votacionTema8
      votacionTema9
      votacionTema10
      votacionTema11
      votacionTema12
      votacionTema13
      votacionTema14
      votacionTema15
      votacionResultado1
      votacionResultado2
      votacionResultado3
      votacionResultado4
      votacionResultado5
      votacionResultado6
      votacionResultado7
      votacionResultado8
      votacionResultado9
      votacionResultado10
      votacionResultado11
      votacionResultado12
      votacionResultado13
      votacionResultado14
      votacionResultado15
      habilitanteTema1
      habilitanteTema2
      habilitanteTema3
      habilitanteTema4
      habilitanteTema5
      habilitanteTema6
      habilitanteTema7
      habilitanteTema8
      habilitanteTema9
      habilitanteTema10
      habilitanteTema11
      habilitanteTema12
      habilitanteTema13
      habilitanteTema14
      habilitanteTema15
      rutaGrabacion
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteAsamblea = /* GraphQL */ `
  mutation DeleteAsamblea(
    $input: DeleteAsambleaInput!
    $condition: ModelAsambleaConditionInput
  ) {
    deleteAsamblea(input: $input, condition: $condition) {
      id
      tipo
      fecha
      hora
      junta
      lugar
      link
      ordenDia
      estado
      email
      registrados
      quorum
      acciones
      participacion
      capital
      acta
      votaciones
      horaAperturaQuorum
      horaCierreQuorum
      cierreQuorum
      presentes
      presentesCapital
      presentesPorcentajePersona
      presentesPorcentajeCapital
      ausentes
      ausentesCapital
      ausentesPorcentajePersona
      ausentesPorcentajeCapital
      representados
      representadosCapital
      representadosPorcentajePersona
      representadosPorcentajeCapital
      totalpresentes
      totalcapitalpresentes
      totalporcentajePersona
      totalporcentajeCapital
      votacionTema1
      votacionTema2
      votacionTema3
      votacionTema4
      votacionTema5
      votacionTema6
      votacionTema7
      votacionTema8
      votacionTema9
      votacionTema10
      votacionTema11
      votacionTema12
      votacionTema13
      votacionTema14
      votacionTema15
      votacionResultado1
      votacionResultado2
      votacionResultado3
      votacionResultado4
      votacionResultado5
      votacionResultado6
      votacionResultado7
      votacionResultado8
      votacionResultado9
      votacionResultado10
      votacionResultado11
      votacionResultado12
      votacionResultado13
      votacionResultado14
      votacionResultado15
      habilitanteTema1
      habilitanteTema2
      habilitanteTema3
      habilitanteTema4
      habilitanteTema5
      habilitanteTema6
      habilitanteTema7
      habilitanteTema8
      habilitanteTema9
      habilitanteTema10
      habilitanteTema11
      habilitanteTema12
      habilitanteTema13
      habilitanteTema14
      habilitanteTema15
      rutaGrabacion
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const createAccionistasxJunta = /* GraphQL */ `
  mutation CreateAccionistasxJunta(
    $input: CreateAccionistasxJuntaInput!
    $condition: ModelAccionistasxJuntaConditionInput
  ) {
    createAccionistasxJunta(input: $input, condition: $condition) {
      id
      asambleaID
      accionistaID
      identificacion
      nombre
      acciones
      estado
      presente
      horaLlegada
      representanteNombre
      representanteDocumento
      representanteDI
      votacion1
      votacion2
      votacion3
      votacion4
      votacion5
      votacion6
      votacion7
      votacion8
      votacion9
      votacion10
      votacion11
      votacion12
      votacion13
      votacion14
      votacion15
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateAccionistasxJunta = /* GraphQL */ `
  mutation UpdateAccionistasxJunta(
    $input: UpdateAccionistasxJuntaInput!
    $condition: ModelAccionistasxJuntaConditionInput
  ) {
    updateAccionistasxJunta(input: $input, condition: $condition) {
      id
      asambleaID
      accionistaID
      identificacion
      nombre
      acciones
      estado
      presente
      horaLlegada
      representanteNombre
      representanteDocumento
      representanteDI
      votacion1
      votacion2
      votacion3
      votacion4
      votacion5
      votacion6
      votacion7
      votacion8
      votacion9
      votacion10
      votacion11
      votacion12
      votacion13
      votacion14
      votacion15
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteAccionistasxJunta = /* GraphQL */ `
  mutation DeleteAccionistasxJunta(
    $input: DeleteAccionistasxJuntaInput!
    $condition: ModelAccionistasxJuntaConditionInput
  ) {
    deleteAccionistasxJunta(input: $input, condition: $condition) {
      id
      asambleaID
      accionistaID
      identificacion
      nombre
      acciones
      estado
      presente
      horaLlegada
      representanteNombre
      representanteDocumento
      representanteDI
      votacion1
      votacion2
      votacion3
      votacion4
      votacion5
      votacion6
      votacion7
      votacion8
      votacion9
      votacion10
      votacion11
      votacion12
      votacion13
      votacion14
      votacion15
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const createDividendosAccionista = /* GraphQL */ `
  mutation CreateDividendosAccionista(
    $input: CreateDividendosAccionistaInput!
    $condition: ModelDividendosAccionistaConditionInput
  ) {
    createDividendosAccionista(input: $input, condition: $condition) {
      id
      idAccionista
      tipoIdentificacion
      identificacion
      nombre
      direccionPais
      paisNacionalidad
      cantidadAcciones
      participacion
      tipoAcciones
      estado
      tipoPersona
      decevale
      idDividendo
      periodo
      dividendo
      baseImponible
      retencion
      dividendoRecibido
      estadoDividendo
      documento
      solicitado
      fechaSolicitud
      HoraSolicitud
      fechaPago
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateDividendosAccionista = /* GraphQL */ `
  mutation UpdateDividendosAccionista(
    $input: UpdateDividendosAccionistaInput!
    $condition: ModelDividendosAccionistaConditionInput
  ) {
    updateDividendosAccionista(input: $input, condition: $condition) {
      id
      idAccionista
      tipoIdentificacion
      identificacion
      nombre
      direccionPais
      paisNacionalidad
      cantidadAcciones
      participacion
      tipoAcciones
      estado
      tipoPersona
      decevale
      idDividendo
      periodo
      dividendo
      baseImponible
      retencion
      dividendoRecibido
      estadoDividendo
      documento
      solicitado
      fechaSolicitud
      HoraSolicitud
      fechaPago
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteDividendosAccionista = /* GraphQL */ `
  mutation DeleteDividendosAccionista(
    $input: DeleteDividendosAccionistaInput!
    $condition: ModelDividendosAccionistaConditionInput
  ) {
    deleteDividendosAccionista(input: $input, condition: $condition) {
      id
      idAccionista
      tipoIdentificacion
      identificacion
      nombre
      direccionPais
      paisNacionalidad
      cantidadAcciones
      participacion
      tipoAcciones
      estado
      tipoPersona
      decevale
      idDividendo
      periodo
      dividendo
      baseImponible
      retencion
      dividendoRecibido
      estadoDividendo
      documento
      solicitado
      fechaSolicitud
      HoraSolicitud
      fechaPago
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const createSolicitudes = /* GraphQL */ `
  mutation CreateSolicitudes(
    $input: CreateSolicitudesInput!
    $condition: ModelSolicitudesConditionInput
  ) {
    createSolicitudes(input: $input, condition: $condition) {
      id
      fecha
      operacion
      idCedente
      cedente
      cedenteIdentificacion
      acciones
      valorVenta
      totalVenta
      cesionarioIdentificacion
      cesionarioNombre
      cesionarioDireccion
      cesionarioEmail
      cesionarioTelefono
      estado
      cs
      ci
      docIdentidad
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateSolicitudes = /* GraphQL */ `
  mutation UpdateSolicitudes(
    $input: UpdateSolicitudesInput!
    $condition: ModelSolicitudesConditionInput
  ) {
    updateSolicitudes(input: $input, condition: $condition) {
      id
      fecha
      operacion
      idCedente
      cedente
      cedenteIdentificacion
      acciones
      valorVenta
      totalVenta
      cesionarioIdentificacion
      cesionarioNombre
      cesionarioDireccion
      cesionarioEmail
      cesionarioTelefono
      estado
      cs
      ci
      docIdentidad
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteSolicitudes = /* GraphQL */ `
  mutation DeleteSolicitudes(
    $input: DeleteSolicitudesInput!
    $condition: ModelSolicitudesConditionInput
  ) {
    deleteSolicitudes(input: $input, condition: $condition) {
      id
      fecha
      operacion
      idCedente
      cedente
      cedenteIdentificacion
      acciones
      valorVenta
      totalVenta
      cesionarioIdentificacion
      cesionarioNombre
      cesionarioDireccion
      cesionarioEmail
      cesionarioTelefono
      estado
      cs
      ci
      docIdentidad
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const createAccionistaArchive = /* GraphQL */ `
  mutation CreateAccionistaArchive(
    $input: CreateAccionistaArchiveInput!
    $condition: ModelAccionistaArchiveConditionInput
  ) {
    createAccionistaArchive(input: $input, condition: $condition) {
      fecha
      id
      tipoIdentificacion
      identificacion
      nombre
      cantidadAcciones
      participacion
      tipoAcciones
      estado
      tipoPersona
      pn_primerNombre
      pn_segundoNombre
      pn_apellidoPaterno
      pn_apellidoMaterno
      decevale
      direccionPais
      paisNacionalidad
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateAccionistaArchive = /* GraphQL */ `
  mutation UpdateAccionistaArchive(
    $input: UpdateAccionistaArchiveInput!
    $condition: ModelAccionistaArchiveConditionInput
  ) {
    updateAccionistaArchive(input: $input, condition: $condition) {
      fecha
      id
      tipoIdentificacion
      identificacion
      nombre
      cantidadAcciones
      participacion
      tipoAcciones
      estado
      tipoPersona
      pn_primerNombre
      pn_segundoNombre
      pn_apellidoPaterno
      pn_apellidoMaterno
      decevale
      direccionPais
      paisNacionalidad
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteAccionistaArchive = /* GraphQL */ `
  mutation DeleteAccionistaArchive(
    $input: DeleteAccionistaArchiveInput!
    $condition: ModelAccionistaArchiveConditionInput
  ) {
    deleteAccionistaArchive(input: $input, condition: $condition) {
      fecha
      id
      tipoIdentificacion
      identificacion
      nombre
      cantidadAcciones
      participacion
      tipoAcciones
      estado
      tipoPersona
      pn_primerNombre
      pn_segundoNombre
      pn_apellidoPaterno
      pn_apellidoMaterno
      decevale
      direccionPais
      paisNacionalidad
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const createTituloArchive = /* GraphQL */ `
  mutation CreateTituloArchive(
    $input: CreateTituloArchiveInput!
    $condition: ModelTituloArchiveConditionInput
  ) {
    createTituloArchive(input: $input, condition: $condition) {
      fecha
      id
      accionistaID
      titulo
      acciones
      fechaCompra
      estado
      idCedenteHereda
      nombreCedenteHereda
      desde
      hasta
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateTituloArchive = /* GraphQL */ `
  mutation UpdateTituloArchive(
    $input: UpdateTituloArchiveInput!
    $condition: ModelTituloArchiveConditionInput
  ) {
    updateTituloArchive(input: $input, condition: $condition) {
      fecha
      id
      accionistaID
      titulo
      acciones
      fechaCompra
      estado
      idCedenteHereda
      nombreCedenteHereda
      desde
      hasta
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteTituloArchive = /* GraphQL */ `
  mutation DeleteTituloArchive(
    $input: DeleteTituloArchiveInput!
    $condition: ModelTituloArchiveConditionInput
  ) {
    deleteTituloArchive(input: $input, condition: $condition) {
      fecha
      id
      accionistaID
      titulo
      acciones
      fechaCompra
      estado
      idCedenteHereda
      nombreCedenteHereda
      desde
      hasta
      createdAt
      updatedAt
      __typename
    }
  }
`;
