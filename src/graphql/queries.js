/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getAumentoCapital = /* GraphQL */ `
  query GetAumentoCapital($id: ID!) {
    getAumentoCapital(id: $id) {
      id
      aum_cap_valor_nominal
      aum_cap_capital
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const listAumentoCapitals = /* GraphQL */ `
  query ListAumentoCapitals(
    $filter: ModelAumentoCapitalFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listAumentoCapitals(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        aum_cap_valor_nominal
        aum_cap_capital
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getAccionistaOperacion = /* GraphQL */ `
  query GetAccionistaOperacion($id: ID!) {
    getAccionistaOperacion(id: $id) {
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
export const listAccionistaOperacions = /* GraphQL */ `
  query ListAccionistaOperacions(
    $filter: ModelAccionistaOperacionFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listAccionistaOperacions(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        acc_ope_detalle
        acc_ope_operacion_id
        acc_ope_accionista_id
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
      tit_ope_acciones
      tit_ope_titulo_id
      tit_ope_operacion_id
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
        tit_ope_acciones
        tit_ope_titulo_id
        tit_ope_operacion_id
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getOperacion = /* GraphQL */ `
  query GetOperacion($id: ID!) {
    getOperacion(id: $id) {
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
export const listOperacions = /* GraphQL */ `
  query ListOperacions(
    $filter: ModelOperacionFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listOperacions(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const getTitulo = /* GraphQL */ `
  query GetTitulo($id: ID!) {
    getTitulo(id: $id) {
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
export const listTitulos = /* GraphQL */ `
  query ListTitulos(
    $filter: ModelTituloFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listTitulos(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const getPersonaNatural = /* GraphQL */ `
  query GetPersonaNatural($id: ID!) {
    getPersonaNatural(id: $id) {
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
export const listPersonaNaturals = /* GraphQL */ `
  query ListPersonaNaturals(
    $filter: ModelPersonaNaturalFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listPersonaNaturals(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const getPersonaJuridica = /* GraphQL */ `
  query GetPersonaJuridica($id: ID!) {
    getPersonaJuridica(id: $id) {
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
export const listPersonaJuridicas = /* GraphQL */ `
  query ListPersonaJuridicas(
    $filter: ModelPersonaJuridicaFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listPersonaJuridicas(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const getConyuge = /* GraphQL */ `
  query GetConyuge($id: ID!) {
    getConyuge(id: $id) {
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
export const listConyuges = /* GraphQL */ `
  query ListConyuges(
    $filter: ModelConyugeFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listConyuges(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const getDividendosTitulos = /* GraphQL */ `
  query GetDividendosTitulos($id: ID!) {
    getDividendosTitulos(id: $id) {
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
export const listDividendosTitulos = /* GraphQL */ `
  query ListDividendosTitulos(
    $filter: ModelDividendosTitulosFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listDividendosTitulos(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const getDetalleDividendo = /* GraphQL */ `
  query GetDetalleDividendo($id: ID!) {
    getDetalleDividendo(id: $id) {
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
export const listDetalleDividendos = /* GraphQL */ `
  query ListDetalleDividendos(
    $filter: ModelDetalleDividendoFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listDetalleDividendos(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const getDividendoNuevo = /* GraphQL */ `
  query GetDividendoNuevo($id: ID!) {
    getDividendoNuevo(id: $id) {
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
export const listDividendoNuevos = /* GraphQL */ `
  query ListDividendoNuevos(
    $filter: ModelDividendoNuevoFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listDividendoNuevos(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        div_periodo
        div_concepto
        div_dividendo
        div_repartido
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
export const getAccionista = /* GraphQL */ `
  query GetAccionista($id: ID!) {
    getAccionista(id: $id) {
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
export const listAccionistas = /* GraphQL */ `
  query ListAccionistas(
    $filter: ModelAccionistaFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listAccionistas(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
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
