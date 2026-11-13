import { ACCESO, OPERACIONES } from '../components/navegacion';
import { DOCUMENTOS_POR_TIPO } from '../services/aprobacion';
import {
  SECCIONES_AYUDA, PERFILES, DESCRIPCION_PERFILES, seccionesDe, seccionDeRuta, buscarAyuda, matrizPermisos, FILAS_PERMISOS,
} from './contenido';

test('cada pantalla de cada perfil tiene su ayuda contextual', () => {
  Object.values(ACCESO).forEach((a) => a.rutas.filter((r) => r !== '/ayuda').forEach((r) => expect([r, seccionDeRuta(r)]).toEqual([r, expect.any(String)])));
});

test('las secciones con ruta solo se muestran a quien puede abrirla', () => {
  expect(seccionesDe('Accionista').map((s) => s.id)).not.toContain('blotter');
  expect(seccionesDe('BackOffice').map((s) => s.id)).not.toContain('parametros');
  expect(seccionesDe('Aprobador').map((s) => s.id)).toEqual(expect.arrayContaining(['blotter', 'roles', 'glosario']));
  PERFILES.forEach((p) => expect(DESCRIPCION_PERFILES[p]).toBeTruthy());
});

test('cada operación documenta los mismos documentos que pide su pantalla', () => {
  OPERACIONES.forEach((o) => {
    const s = SECCIONES_AYUDA.find((x) => x.rutas.includes(o.path));
    expect(s.documentos).toEqual(DOCUMENTOS_POR_TIPO[s.tipo]);
  });
  expect(new Set(SECCIONES_AYUDA.map((s) => s.id)).size).toBe(SECCIONES_AYUDA.length);
});

test('búsqueda sin tildes ni mayúsculas y matriz de permisos', () => {
  expect(buscarAyuda(SECCIONES_AYUDA, 'POSESION heredero').map((s) => s.id)).toContain('posesion-efectiva');
  expect(buscarAyuda(SECCIONES_AYUDA, 'quorum').map((s) => s.id)).toContain('asambleas');
  expect(buscarAyuda(SECCIONES_AYUDA, 'zzzz')).toEqual([]);
  const blotter = matrizPermisos(FILAS_PERMISOS).find((f) => f.path === '/blotter');
  expect(blotter.perfiles).toEqual({ Administrador: true, Aprobador: true, BackOffice: false, Accionista: false });
});
