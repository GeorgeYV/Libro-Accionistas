import React from 'react';
import { render, screen, act } from '@testing-library/react';
import Cargando from './cargando';



test('bloquea de inmediato y muestra el mensaje tras el retraso', () => {
  jest.useFakeTimers(); // dentro del test: CRA reinicia los mocks antes de cada uno
  const { rerender } = render(<Cargando abierto mensaje="Guardando" />);
  // La capa ya está montada (bloquea), pero la tarjeta aún no se ve.
  expect(screen.getByRole('presentation')).toBeTruthy();
  expect(screen.getByText('Guardando…').closest('[aria-busy]').style.visibility).toBe('hidden');
  act(() => { jest.advanceTimersByTime(350); });
  expect(screen.getByText('Guardando…').closest('[aria-busy]').style.visibility).toBe('visible');
  rerender(<Cargando abierto={false} mensaje="Guardando" />);
  expect(screen.queryByText('Guardando…')).toBeNull();
});
