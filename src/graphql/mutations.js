/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createEstadoCatalogo = /* GraphQL */ `
  mutation CreateEstadoCatalogo(
    $input: CreateEstadoCatalogoInput!
    $condition: ModelEstadoCatalogoConditionInput
  ) {
    createEstadoCatalogo(input: $input, condition: $condition) {
      id
      nombre
      nombreCorto
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateEstadoCatalogo = /* GraphQL */ `
  mutation UpdateEstadoCatalogo(
    $input: UpdateEstadoCatalogoInput!
    $condition: ModelEstadoCatalogoConditionInput
  ) {
    updateEstadoCatalogo(input: $input, condition: $condition) {
      id
      nombre
      nombreCorto
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteEstadoCatalogo = /* GraphQL */ `
  mutation DeleteEstadoCatalogo(
    $input: DeleteEstadoCatalogoInput!
    $condition: ModelEstadoCatalogoConditionInput
  ) {
    deleteEstadoCatalogo(input: $input, condition: $condition) {
      id
      nombre
      nombreCorto
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const createTipoPersona = /* GraphQL */ `
  mutation CreateTipoPersona(
    $input: CreateTipoPersonaInput!
    $condition: ModelTipoPersonaConditionInput
  ) {
    createTipoPersona(input: $input, condition: $condition) {
      id
      nombre
      nombreCorto
      estado
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateTipoPersona = /* GraphQL */ `
  mutation UpdateTipoPersona(
    $input: UpdateTipoPersonaInput!
    $condition: ModelTipoPersonaConditionInput
  ) {
    updateTipoPersona(input: $input, condition: $condition) {
      id
      nombre
      nombreCorto
      estado
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteTipoPersona = /* GraphQL */ `
  mutation DeleteTipoPersona(
    $input: DeleteTipoPersonaInput!
    $condition: ModelTipoPersonaConditionInput
  ) {
    deleteTipoPersona(input: $input, condition: $condition) {
      id
      nombre
      nombreCorto
      estado
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const createTipoIdentificacion = /* GraphQL */ `
  mutation CreateTipoIdentificacion(
    $input: CreateTipoIdentificacionInput!
    $condition: ModelTipoIdentificacionConditionInput
  ) {
    createTipoIdentificacion(input: $input, condition: $condition) {
      id
      nombre
      nombreCorto
      estado
      tipoPersona
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateTipoIdentificacion = /* GraphQL */ `
  mutation UpdateTipoIdentificacion(
    $input: UpdateTipoIdentificacionInput!
    $condition: ModelTipoIdentificacionConditionInput
  ) {
    updateTipoIdentificacion(input: $input, condition: $condition) {
      id
      nombre
      nombreCorto
      estado
      tipoPersona
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteTipoIdentificacion = /* GraphQL */ `
  mutation DeleteTipoIdentificacion(
    $input: DeleteTipoIdentificacionInput!
    $condition: ModelTipoIdentificacionConditionInput
  ) {
    deleteTipoIdentificacion(input: $input, condition: $condition) {
      id
      nombre
      nombreCorto
      estado
      tipoPersona
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const createEstadoCivil = /* GraphQL */ `
  mutation CreateEstadoCivil(
    $input: CreateEstadoCivilInput!
    $condition: ModelEstadoCivilConditionInput
  ) {
    createEstadoCivil(input: $input, condition: $condition) {
      id
      nombre
      estado
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateEstadoCivil = /* GraphQL */ `
  mutation UpdateEstadoCivil(
    $input: UpdateEstadoCivilInput!
    $condition: ModelEstadoCivilConditionInput
  ) {
    updateEstadoCivil(input: $input, condition: $condition) {
      id
      nombre
      estado
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteEstadoCivil = /* GraphQL */ `
  mutation DeleteEstadoCivil(
    $input: DeleteEstadoCivilInput!
    $condition: ModelEstadoCivilConditionInput
  ) {
    deleteEstadoCivil(input: $input, condition: $condition) {
      id
      nombre
      estado
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
export const createTipoMedioContacto = /* GraphQL */ `
  mutation CreateTipoMedioContacto(
    $input: CreateTipoMedioContactoInput!
    $condition: ModelTipoMedioContactoConditionInput
  ) {
    createTipoMedioContacto(input: $input, condition: $condition) {
      id
      nombre
      estado
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateTipoMedioContacto = /* GraphQL */ `
  mutation UpdateTipoMedioContacto(
    $input: UpdateTipoMedioContactoInput!
    $condition: ModelTipoMedioContactoConditionInput
  ) {
    updateTipoMedioContacto(input: $input, condition: $condition) {
      id
      nombre
      estado
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteTipoMedioContacto = /* GraphQL */ `
  mutation DeleteTipoMedioContacto(
    $input: DeleteTipoMedioContactoInput!
    $condition: ModelTipoMedioContactoConditionInput
  ) {
    deleteTipoMedioContacto(input: $input, condition: $condition) {
      id
      nombre
      estado
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const createCuentaBancaria = /* GraphQL */ `
  mutation CreateCuentaBancaria(
    $input: CreateCuentaBancariaInput!
    $condition: ModelCuentaBancariaConditionInput
  ) {
    createCuentaBancaria(input: $input, condition: $condition) {
      id
      nombre
      nombreCorto
      estado
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateCuentaBancaria = /* GraphQL */ `
  mutation UpdateCuentaBancaria(
    $input: UpdateCuentaBancariaInput!
    $condition: ModelCuentaBancariaConditionInput
  ) {
    updateCuentaBancaria(input: $input, condition: $condition) {
      id
      nombre
      nombreCorto
      estado
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteCuentaBancaria = /* GraphQL */ `
  mutation DeleteCuentaBancaria(
    $input: DeleteCuentaBancariaInput!
    $condition: ModelCuentaBancariaConditionInput
  ) {
    deleteCuentaBancaria(input: $input, condition: $condition) {
      id
      nombre
      nombreCorto
      estado
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const createEstadoAccionista = /* GraphQL */ `
  mutation CreateEstadoAccionista(
    $input: CreateEstadoAccionistaInput!
    $condition: ModelEstadoAccionistaConditionInput
  ) {
    createEstadoAccionista(input: $input, condition: $condition) {
      id
      nombre
      nombreCorto
      descripcion
      estado
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateEstadoAccionista = /* GraphQL */ `
  mutation UpdateEstadoAccionista(
    $input: UpdateEstadoAccionistaInput!
    $condition: ModelEstadoAccionistaConditionInput
  ) {
    updateEstadoAccionista(input: $input, condition: $condition) {
      id
      nombre
      nombreCorto
      descripcion
      estado
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteEstadoAccionista = /* GraphQL */ `
  mutation DeleteEstadoAccionista(
    $input: DeleteEstadoAccionistaInput!
    $condition: ModelEstadoAccionistaConditionInput
  ) {
    deleteEstadoAccionista(input: $input, condition: $condition) {
      id
      nombre
      nombreCorto
      descripcion
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
      tipoIdentificacion
      identificacion
      nombre
      direccionPais
      direccionProvincia
      direccionCiudad
      direccionCalle
      direccionNumero
      nombreBanco
      tipoCuenta
      cuentaBancaria
      paisNacionalidad
      cantidadAcciones
      participacion
      tipoAcciones
      estado
      tipoPersona
      pn_primerNombre
      pn_segundoNombre
      pn_apellidoPaterno
      pn_apellidoMaterno
      pn_estadoCivil
      conyugue_tipoIdentificacion
      conyugue_identificacion
      conyugue_nombre
      conyugue_nacionalidad
      repLegal_tipoIdentificacion
      repLegal_identificacion
      repLegal_nombre
      repLegal_nacionalidad
      repLegal_telefono
      repLegal_email
      telefono1
      obs1
      telefono2
      obs2
      telefono3
      obs3
      email1
      email2
      email3
      docIdentidadPrincipal
      docCertificadoBancario
      docIdentidadConyugue
      herederos
      esHeredero
      decevale
      docPosesionEfectiva
      nombreBeneficiario1
      fechaBeneficiario1
      direccionPaisBeneficiario1
      nombreBeneficiario2
      fechaBeneficiario2
      nombreBeneficiario3
      fechaBeneficiario3
      nombreBeneficiario4
      fechaBeneficiario4
      nombreBeneficiario5
      fechaBeneficiario5
      nombreBeneficiario6
      fechaBeneficiario6
      nombreBeneficiario7
      fechaBeneficiario7
      nombreBeneficiario8
      fechaBeneficiario8
      nombreBeneficiario9
      fechaBeneficiario9
      titulos {
        items {
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
        nextToken
        __typename
      }
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
      tipoIdentificacion
      identificacion
      nombre
      direccionPais
      direccionProvincia
      direccionCiudad
      direccionCalle
      direccionNumero
      nombreBanco
      tipoCuenta
      cuentaBancaria
      paisNacionalidad
      cantidadAcciones
      participacion
      tipoAcciones
      estado
      tipoPersona
      pn_primerNombre
      pn_segundoNombre
      pn_apellidoPaterno
      pn_apellidoMaterno
      pn_estadoCivil
      conyugue_tipoIdentificacion
      conyugue_identificacion
      conyugue_nombre
      conyugue_nacionalidad
      repLegal_tipoIdentificacion
      repLegal_identificacion
      repLegal_nombre
      repLegal_nacionalidad
      repLegal_telefono
      repLegal_email
      telefono1
      obs1
      telefono2
      obs2
      telefono3
      obs3
      email1
      email2
      email3
      docIdentidadPrincipal
      docCertificadoBancario
      docIdentidadConyugue
      herederos
      esHeredero
      decevale
      docPosesionEfectiva
      nombreBeneficiario1
      fechaBeneficiario1
      direccionPaisBeneficiario1
      nombreBeneficiario2
      fechaBeneficiario2
      nombreBeneficiario3
      fechaBeneficiario3
      nombreBeneficiario4
      fechaBeneficiario4
      nombreBeneficiario5
      fechaBeneficiario5
      nombreBeneficiario6
      fechaBeneficiario6
      nombreBeneficiario7
      fechaBeneficiario7
      nombreBeneficiario8
      fechaBeneficiario8
      nombreBeneficiario9
      fechaBeneficiario9
      titulos {
        items {
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
        nextToken
        __typename
      }
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
      tipoIdentificacion
      identificacion
      nombre
      direccionPais
      direccionProvincia
      direccionCiudad
      direccionCalle
      direccionNumero
      nombreBanco
      tipoCuenta
      cuentaBancaria
      paisNacionalidad
      cantidadAcciones
      participacion
      tipoAcciones
      estado
      tipoPersona
      pn_primerNombre
      pn_segundoNombre
      pn_apellidoPaterno
      pn_apellidoMaterno
      pn_estadoCivil
      conyugue_tipoIdentificacion
      conyugue_identificacion
      conyugue_nombre
      conyugue_nacionalidad
      repLegal_tipoIdentificacion
      repLegal_identificacion
      repLegal_nombre
      repLegal_nacionalidad
      repLegal_telefono
      repLegal_email
      telefono1
      obs1
      telefono2
      obs2
      telefono3
      obs3
      email1
      email2
      email3
      docIdentidadPrincipal
      docCertificadoBancario
      docIdentidadConyugue
      herederos
      esHeredero
      decevale
      docPosesionEfectiva
      nombreBeneficiario1
      fechaBeneficiario1
      direccionPaisBeneficiario1
      nombreBeneficiario2
      fechaBeneficiario2
      nombreBeneficiario3
      fechaBeneficiario3
      nombreBeneficiario4
      fechaBeneficiario4
      nombreBeneficiario5
      fechaBeneficiario5
      nombreBeneficiario6
      fechaBeneficiario6
      nombreBeneficiario7
      fechaBeneficiario7
      nombreBeneficiario8
      fechaBeneficiario8
      nombreBeneficiario9
      fechaBeneficiario9
      titulos {
        items {
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
        nextToken
        __typename
      }
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
export const updateTitulo = /* GraphQL */ `
  mutation UpdateTitulo(
    $input: UpdateTituloInput!
    $condition: ModelTituloConditionInput
  ) {
    updateTitulo(input: $input, condition: $condition) {
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
export const deleteTitulo = /* GraphQL */ `
  mutation DeleteTitulo(
    $input: DeleteTituloInput!
    $condition: ModelTituloConditionInput
  ) {
    deleteTitulo(input: $input, condition: $condition) {
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
export const createOperaciones = /* GraphQL */ `
  mutation CreateOperaciones(
    $input: CreateOperacionesInput!
    $condition: ModelOperacionesConditionInput
  ) {
    createOperaciones(input: $input, condition: $condition) {
      id
      fecha
      operacion
      idCedente
      cedente
      titulo
      acciones
      idCesionario
      cesionario
      estado
      usuarioIngreso
      usuarioAprobador
      titulos {
        items {
          id
          operacionID
          tituloId
          titulo
          acciones
          accionesTransferidas
          desde
          hasta
          createdAt
          updatedAt
          __typename
        }
        nextToken
        __typename
      }
      cs
      cg
      ci
      es
      cp
      ced
      cb
      nom
      fechaAprobacion
      motivoRechazo
      observacion
      valorNominal
      capital
      fechaValor
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateOperaciones = /* GraphQL */ `
  mutation UpdateOperaciones(
    $input: UpdateOperacionesInput!
    $condition: ModelOperacionesConditionInput
  ) {
    updateOperaciones(input: $input, condition: $condition) {
      id
      fecha
      operacion
      idCedente
      cedente
      titulo
      acciones
      idCesionario
      cesionario
      estado
      usuarioIngreso
      usuarioAprobador
      titulos {
        items {
          id
          operacionID
          tituloId
          titulo
          acciones
          accionesTransferidas
          desde
          hasta
          createdAt
          updatedAt
          __typename
        }
        nextToken
        __typename
      }
      cs
      cg
      ci
      es
      cp
      ced
      cb
      nom
      fechaAprobacion
      motivoRechazo
      observacion
      valorNominal
      capital
      fechaValor
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteOperaciones = /* GraphQL */ `
  mutation DeleteOperaciones(
    $input: DeleteOperacionesInput!
    $condition: ModelOperacionesConditionInput
  ) {
    deleteOperaciones(input: $input, condition: $condition) {
      id
      fecha
      operacion
      idCedente
      cedente
      titulo
      acciones
      idCesionario
      cesionario
      estado
      usuarioIngreso
      usuarioAprobador
      titulos {
        items {
          id
          operacionID
          tituloId
          titulo
          acciones
          accionesTransferidas
          desde
          hasta
          createdAt
          updatedAt
          __typename
        }
        nextToken
        __typename
      }
      cs
      cg
      ci
      es
      cp
      ced
      cb
      nom
      fechaAprobacion
      motivoRechazo
      observacion
      valorNominal
      capital
      fechaValor
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
      operacionID
      tituloId
      titulo
      acciones
      accionesTransferidas
      desde
      hasta
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
      operacionID
      tituloId
      titulo
      acciones
      accionesTransferidas
      desde
      hasta
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
      operacionID
      tituloId
      titulo
      acciones
      accionesTransferidas
      desde
      hasta
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const createHerederoPorOperacion = /* GraphQL */ `
  mutation CreateHerederoPorOperacion(
    $input: CreateHerederoPorOperacionInput!
    $condition: ModelHerederoPorOperacionConditionInput
  ) {
    createHerederoPorOperacion(input: $input, condition: $condition) {
      id
      operacionId
      numeroHeredero
      herederoId
      nombre
      cantidad
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateHerederoPorOperacion = /* GraphQL */ `
  mutation UpdateHerederoPorOperacion(
    $input: UpdateHerederoPorOperacionInput!
    $condition: ModelHerederoPorOperacionConditionInput
  ) {
    updateHerederoPorOperacion(input: $input, condition: $condition) {
      id
      operacionId
      numeroHeredero
      herederoId
      nombre
      cantidad
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteHerederoPorOperacion = /* GraphQL */ `
  mutation DeleteHerederoPorOperacion(
    $input: DeleteHerederoPorOperacionInput!
    $condition: ModelHerederoPorOperacionConditionInput
  ) {
    deleteHerederoPorOperacion(input: $input, condition: $condition) {
      id
      operacionId
      numeroHeredero
      herederoId
      nombre
      cantidad
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const createNumeroSecuencial = /* GraphQL */ `
  mutation CreateNumeroSecuencial(
    $input: CreateNumeroSecuencialInput!
    $condition: ModelNumeroSecuencialConditionInput
  ) {
    createNumeroSecuencial(input: $input, condition: $condition) {
      id
      numerotitulo
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateNumeroSecuencial = /* GraphQL */ `
  mutation UpdateNumeroSecuencial(
    $input: UpdateNumeroSecuencialInput!
    $condition: ModelNumeroSecuencialConditionInput
  ) {
    updateNumeroSecuencial(input: $input, condition: $condition) {
      id
      numerotitulo
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteNumeroSecuencial = /* GraphQL */ `
  mutation DeleteNumeroSecuencial(
    $input: DeleteNumeroSecuencialInput!
    $condition: ModelNumeroSecuencialConditionInput
  ) {
    deleteNumeroSecuencial(input: $input, condition: $condition) {
      id
      numerotitulo
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
export const createDividendos = /* GraphQL */ `
  mutation CreateDividendos(
    $input: CreateDividendosInput!
    $condition: ModelDividendosConditionInput
  ) {
    createDividendos(input: $input, condition: $condition) {
      id
      periodo
      secuencial
      concepto
      dividendo
      porcentajeRepartir
      dividendoRepartir
      fechaCorte
      fechaPago
      estado
      retencion
      idDividendoOrigen
      saldoDividendo
      saldoPorcentajeDividendo
      entregado
      porEntregar
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateDividendos = /* GraphQL */ `
  mutation UpdateDividendos(
    $input: UpdateDividendosInput!
    $condition: ModelDividendosConditionInput
  ) {
    updateDividendos(input: $input, condition: $condition) {
      id
      periodo
      secuencial
      concepto
      dividendo
      porcentajeRepartir
      dividendoRepartir
      fechaCorte
      fechaPago
      estado
      retencion
      idDividendoOrigen
      saldoDividendo
      saldoPorcentajeDividendo
      entregado
      porEntregar
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteDividendos = /* GraphQL */ `
  mutation DeleteDividendos(
    $input: DeleteDividendosInput!
    $condition: ModelDividendosConditionInput
  ) {
    deleteDividendos(input: $input, condition: $condition) {
      id
      periodo
      secuencial
      concepto
      dividendo
      porcentajeRepartir
      dividendoRepartir
      fechaCorte
      fechaPago
      estado
      retencion
      idDividendoOrigen
      saldoDividendo
      saldoPorcentajeDividendo
      entregado
      porEntregar
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
