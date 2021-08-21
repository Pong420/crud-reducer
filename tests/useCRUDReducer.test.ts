import { createUseCrudReducer } from '../src/useCrudReducer';
import { renderHook, act } from '@testing-library/react-hooks';

interface Schema {
  id: string;
  value: string;
}

let count = 0;

function createMock(): Schema {
  return { id: String(count++), value: String(Math.random()) };
}

// function createMocks(length: number): Schema[] {
//   return Array.from({ length }, () => createMock());
// }

describe('crud reducer', () => {
  test('normal', () => {
    const useCRUDReducer = createUseCrudReducer<Schema, 'id'>('id');
    const { result } = renderHook(() => useCRUDReducer());
    const [, actions] = result.current;
    const mock = createMock();
    const newValue = { ...mock, value: '123' };

    act(() => actions.create(mock));
    expect(result.current[0].list).toEqual([mock]);

    act(() => actions.update(newValue));
    expect(result.current[0].list).toEqual([newValue]);

    act(() => actions.delete(mock));
    expect(result.current[0].list).toEqual([]);

    expect(useCRUDReducer).toBeDefined();
  });
  test('typings prefill is true', () => {
    const useCRUDReducer = createUseCrudReducer<Schema, 'id'>('id');
    expect(useCRUDReducer).toBeDefined();
  });
  test('typings - prefill is false', () => {
    const useCRUDReducer = createUseCrudReducer<Schema, 'id'>('id', {
      prefill: false
    });
    expect(useCRUDReducer).toBeDefined();
  });
});
