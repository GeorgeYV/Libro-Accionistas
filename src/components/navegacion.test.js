import { perfilDe, accesoDe, etiquetaRuta, ACCESO, OPERACIONES } from './navegacion';

const usuario = (grupos) => ({ signInUserSession: { accessToken: { payload: grupos ? { 'cognito:groups': grupos } : {} } } });

test('perfilDe toma el primer grupo y tolera usuarios sin grupos', () => {
  expect(perfilDe(usuario(['Aprobador', 'Otro']))).toBe('Aprobador');
  expect(perfilDe(usuario(null))).toBeNull();
  expect(perfilDe({})).toBeNull();
  expect(accesoDe('Desconocido')).toBeNull();
});

test('cada perfil puede abrir lo que muestra su menú y su inicio', () => {
  Object.values(ACCESO).forEach((a) => {
    a.menu.forEach((m) => expect(a.rutas).toContain(m.path));
    expect(a.rutas).toContain(a.inicio);
    if (a.ingresa) OPERACIONES.forEach((o) => expect(a.rutas).toContain(o.path));
  });
  expect(ACCESO.BackOffice.rutas).not.toContain('/parametros');
  expect(ACCESO.Aprobador.rutas).not.toContain('/cesion');
  expect(ACCESO.Accionista.rutas).not.toContain('/accionistas');
});

test('etiquetaRuta', () => {
  expect(etiquetaRuta('/posesionefectiva')).toBe('Posesión efectiva');
  expect(etiquetaRuta('/nada')).toBe('');
});
