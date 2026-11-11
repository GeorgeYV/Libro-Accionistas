import { enmascarar, accionistasAfectados } from './certificados';

test('enmascarar conserva solo extremos', () => {
  expect(enmascarar('1712345677')).toBe('17******77');
  expect(enmascarar('1790012345001')).toBe('17*********01');
  expect(enmascarar('1234')).toBe('***4');
  expect(enmascarar('')).toBe('');
  expect(enmascarar(null)).toBe('');
});

test('accionistasAfectados reúne principal, cesionario y herederos sin repetir', () => {
  expect(accionistasAfectados({ principal: { id: 'A' }, cesionario: { id: 'B' } })).toEqual(['A', 'B']);
  expect(accionistasAfectados({ principal: { id: 'M' }, cesionario: null, herederos: [{ her_identificacion: 'H1' }, { her_identificacion: 'M' }] }))
    .toEqual(['M', 'H1']);
  expect(accionistasAfectados({ principal: null })).toEqual([]);
});
