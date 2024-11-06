/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getEstadoCatalogo = /* GraphQL */ `
  query GetEstadoCatalogo($id: ID!) {
    getEstadoCatalogo(id: $id) {
      id
      nombre
      nombreCorto
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const listEstadoCatalogos = /* GraphQL */ `
  query ListEstadoCatalogos(
    $filter: ModelEstadoCatalogoFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listEstadoCatalogos(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        nombre
        nombreCorto
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getTipoPersona = /* GraphQL */ `
  query GetTipoPersona($id: ID!) {
    getTipoPersona(id: $id) {
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
export const listTipoPersonas = /* GraphQL */ `
  query ListTipoPersonas(
    $filter: ModelTipoPersonaFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listTipoPersonas(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        nombre
        nombreCorto
        estado
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getTipoIdentificacion = /* GraphQL */ `
  query GetTipoIdentificacion($id: ID!) {
    getTipoIdentificacion(id: $id) {
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
export const listTipoIdentificacions = /* GraphQL */ `
  query ListTipoIdentificacions(
    $filter: ModelTipoIdentificacionFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listTipoIdentificacions(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        nombre
        nombreCorto
        estado
        tipoPersona
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getEstadoCivil = /* GraphQL */ `
  query GetEstadoCivil($id: ID!) {
    getEstadoCivil(id: $id) {
      id
      nombre
      estado
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const listEstadoCivils = /* GraphQL */ `
  query ListEstadoCivils(
    $filter: ModelEstadoCivilFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listEstadoCivils(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        nombre
        estado
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getPais = /* GraphQL */ `
  query GetPais($id: ID!) {
    getPais(id: $id) {
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
export const listPais = /* GraphQL */ `
  query ListPais(
    $filter: ModelPaisFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listPais(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const getProvincia = /* GraphQL */ `
  query GetProvincia($id: ID!) {
    getProvincia(id: $id) {
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
export const listProvincias = /* GraphQL */ `
  query ListProvincias(
    $filter: ModelProvinciaFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listProvincias(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        nombre
        Pais
        estado
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getCiudad = /* GraphQL */ `
  query GetCiudad($id: ID!) {
    getCiudad(id: $id) {
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
export const listCiudads = /* GraphQL */ `
  query ListCiudads(
    $filter: ModelCiudadFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listCiudads(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        nombre
        Provincia
        estado
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getTipoMedioContacto = /* GraphQL */ `
  query GetTipoMedioContacto($id: ID!) {
    getTipoMedioContacto(id: $id) {
      id
      nombre
      estado
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const listTipoMedioContactos = /* GraphQL */ `
  query ListTipoMedioContactos(
    $filter: ModelTipoMedioContactoFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listTipoMedioContactos(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        nombre
        estado
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getCuentaBancaria = /* GraphQL */ `
  query GetCuentaBancaria($id: ID!) {
    getCuentaBancaria(id: $id) {
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
export const listCuentaBancarias = /* GraphQL */ `
  query ListCuentaBancarias(
    $filter: ModelCuentaBancariaFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listCuentaBancarias(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        nombre
        nombreCorto
        estado
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getEstadoAccionista = /* GraphQL */ `
  query GetEstadoAccionista($id: ID!) {
    getEstadoAccionista(id: $id) {
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
export const listEstadoAccionistas = /* GraphQL */ `
  query ListEstadoAccionistas(
    $filter: ModelEstadoAccionistaFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listEstadoAccionistas(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        nombre
        nombreCorto
        descripcion
        estado
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getAccionista = /* GraphQL */ `
  query GetAccionista($id: ID!) {
    getAccionista(id: $id) {
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
export const listAccionistas = /* GraphQL */ `
  query ListAccionistas(
    $filter: ModelAccionistaFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listAccionistas(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
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
          nextToken
          __typename
        }
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getTitulo = /* GraphQL */ `
  query GetTitulo($id: ID!) {
    getTitulo(id: $id) {
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
export const listTitulos = /* GraphQL */ `
  query ListTitulos(
    $filter: ModelTituloFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listTitulos(filter: $filter, limit: $limit, nextToken: $nextToken) {
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
  }
`;
export const getHeredero = /* GraphQL */ `
  query GetHeredero($id: ID!) {
    getHeredero(id: $id) {
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
export const listHerederos = /* GraphQL */ `
  query ListHerederos(
    $filter: ModelHerederoFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listHerederos(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const getOperaciones = /* GraphQL */ `
  query GetOperaciones($id: ID!) {
    getOperaciones(id: $id) {
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
export const listOperaciones = /* GraphQL */ `
  query ListOperaciones(
    $filter: ModelOperacionesFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listOperaciones(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const getTituloPorOperacion = /* GraphQL */ `
  query GetTituloPorOperacion($id: ID!) {
    getTituloPorOperacion(id: $id) {
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
export const listTituloPorOperacions = /* GraphQL */ `
  query ListTituloPorOperacions(
    $filter: ModelTituloPorOperacionFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listTituloPorOperacions(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
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
  }
`;
export const getHerederoPorOperacion = /* GraphQL */ `
  query GetHerederoPorOperacion($id: ID!) {
    getHerederoPorOperacion(id: $id) {
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
export const listHerederoPorOperacions = /* GraphQL */ `
  query ListHerederoPorOperacions(
    $filter: ModelHerederoPorOperacionFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listHerederoPorOperacions(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const getNumeroSecuencial = /* GraphQL */ `
  query GetNumeroSecuencial($id: ID!) {
    getNumeroSecuencial(id: $id) {
      id
      numerotitulo
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const listNumeroSecuencials = /* GraphQL */ `
  query ListNumeroSecuencials(
    $filter: ModelNumeroSecuencialFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listNumeroSecuencials(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        numerotitulo
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getParametro = /* GraphQL */ `
  query GetParametro($id: ID!) {
    getParametro(id: $id) {
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
export const listParametros = /* GraphQL */ `
  query ListParametros(
    $filter: ModelParametroFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listParametros(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const getParametroArchive = /* GraphQL */ `
  query GetParametroArchive($id: ID!) {
    getParametroArchive(id: $id) {
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
export const listParametroArchives = /* GraphQL */ `
  query ListParametroArchives(
    $filter: ModelParametroArchiveFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listParametroArchives(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const getAsamblea = /* GraphQL */ `
  query GetAsamblea($id: ID!) {
    getAsamblea(id: $id) {
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
export const listAsambleas = /* GraphQL */ `
  query ListAsambleas(
    $filter: ModelAsambleaFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listAsambleas(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const getAccionistasxJunta = /* GraphQL */ `
  query GetAccionistasxJunta($id: ID!) {
    getAccionistasxJunta(id: $id) {
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
export const listAccionistasxJuntas = /* GraphQL */ `
  query ListAccionistasxJuntas(
    $filter: ModelAccionistasxJuntaFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listAccionistasxJuntas(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const getDividendos = /* GraphQL */ `
  query GetDividendos($id: ID!) {
    getDividendos(id: $id) {
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
export const listDividendos = /* GraphQL */ `
  query ListDividendos(
    $filter: ModelDividendosFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listDividendos(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const getDividendosAccionista = /* GraphQL */ `
  query GetDividendosAccionista($id: ID!) {
    getDividendosAccionista(id: $id) {
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
export const listDividendosAccionistas = /* GraphQL */ `
  query ListDividendosAccionistas(
    $filter: ModelDividendosAccionistaFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listDividendosAccionistas(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const getSolicitudes = /* GraphQL */ `
  query GetSolicitudes($id: ID!) {
    getSolicitudes(id: $id) {
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
export const listSolicitudes = /* GraphQL */ `
  query ListSolicitudes(
    $filter: ModelSolicitudesFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listSolicitudes(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const getAccionistaArchive = /* GraphQL */ `
  query GetAccionistaArchive($id: ID!) {
    getAccionistaArchive(id: $id) {
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
export const listAccionistaArchives = /* GraphQL */ `
  query ListAccionistaArchives(
    $filter: ModelAccionistaArchiveFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listAccionistaArchives(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const getTituloArchive = /* GraphQL */ `
  query GetTituloArchive($id: ID!) {
    getTituloArchive(id: $id) {
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
export const listTituloArchives = /* GraphQL */ `
  query ListTituloArchives(
    $filter: ModelTituloArchiveFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listTituloArchives(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const AccionistaArchiveByFecha = /* GraphQL */ `
  query AccionistaArchiveByFecha(
    $fecha: String
    $estado: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelAccionistaArchiveFilterInput
    $limit: Int
    $nextToken: String
  ) {
    AccionistaArchiveByFecha(
      fecha: $fecha
      estado: $estado
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
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
      nextToken
      __typename
    }
  }
`;
