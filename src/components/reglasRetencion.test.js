import React from 'react';
import { render, screen } from '@testing-library/react';
import ReglasRetencion from './reglasRetencion';
import { REGLAS_INICIALES } from '../utils/retencion';

test('cargar el catálogo de países no borra la residencia de ninguna regla', () => {
  const onChange = jest.fn();
  const { rerender } = render(<ReglasRetencion reglas={REGLAS_INICIALES} onChange={onChange} sbu={482} paises={[]} />);
  // El catálogo llega después (como en Parámetros): antes esto disparaba un "reset" que vaciaba la regla 8.
  rerender(<ReglasRetencion reglas={REGLAS_INICIALES} onChange={onChange} sbu={482}
    paises={[{ nombre: 'Ecuador', estado: 'Activo' }, { nombre: 'Perú', estado: 'Activo' }]} />);
  expect(onChange).not.toHaveBeenCalled();
  const residencias = screen.getAllByPlaceholderText('Ecuador, Exterior o un país').map((i) => i.value);
  expect(residencias).toEqual(REGLAS_INICIALES.map((r) => r.residencia));
});
