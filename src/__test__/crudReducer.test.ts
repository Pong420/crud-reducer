import { DefaultCRUDActionTypes, getCRUDActionsCreator } from '../crudAction';
import { createCRUDReducer } from '../crudReducer';
import qs from 'qs';

interface Schema {
  id: string;
  value: string;
}

let count = 0;

function createMock(): Schema {
  return { id: String(count++), value: String(Math.random()) };
}

function createMocks(length: number): Schema[] {
  return Array.from({ length }, () => createMock());
}

const [, customActionTypes] = getCRUDActionsCreator<Schema, 'id'>()({
  LIST: 'LIST_SCHEMA',
  CREATE: 'CREATE_SCHEMA',
  UPDATE: 'UPDATE_SCHEMA',
  DELETE: 'DELETE_SCHEMA',
  PAGINATE: 'PAGINATE_SCHEMA',
  PARAMS: 'PARAMS_SCHEMA',
  RESET: 'RESET_SCHEMA'
} as const);

const testOptions = [
  ['default', DefaultCRUDActionTypes],
  ['custom ', customActionTypes]
] as const;

describe.each(testOptions)('crud reducer - %s', (_, actionTypes) => {
  const [initialState, crudReducer] = createCRUDReducer<Schema, 'id'>('id', {
    actionTypes
  });

  test('default', () => {
    const state: any = undefined;
    const action: any = { type: 'action' };
    expect(crudReducer(state, action)).toEqual(initialState);
  });

  test('list', () => {
    function list(initial: typeof state, payload: Schema[]) {
      const state = crudReducer(initial, {
        type: actionTypes['LIST'],
        payload: payload
      });
      expect(state.list).toEqual(payload);
      expect(state.ids).toEqual(payload.map(i => i.id));
      expect(state.byIds).toEqual(
        payload.reduce((r, i) => ({ ...r, [i.id]: i }), {})
      );
      return state;
    }

    const state = list(initialState, createMocks(3));

    // The old state should be overwritten.
    list(state, createMocks(5));
  });

  test('create', () => {
    function create(initial: typeof state, payload: Schema) {
      const state = crudReducer(initial, {
        type: actionTypes['CREATE'],
        payload: payload
      });
      expect(state.list).toContain(payload);
      expect(state.ids).toContain(payload.id);
      expect(state.byIds).toMatchObject({ [payload.id]: payload });
      return state;
    }
    const mock1 = createMock();
    const mock2 = createMock();
    let state = create(initialState, mock1);
    state = create(state, mock2);
    expect(state.list).toEqual([mock1, mock2]);
    expect(state.ids).toEqual([mock1.id, mock2.id]);
  });

  test('update', () => {
    const mock = createMock();
    const state0 = crudReducer(initialState, {
      type: actionTypes['CREATE'],
      payload: mock
    });

    const newValue = '123';
    const payload = { id: mock.id, value: newValue };
    const state1 = crudReducer(state0, {
      type: actionTypes['UPDATE'],
      payload
    });

    // should not be ignored
    const state2 = crudReducer(state1, {
      type: actionTypes['UPDATE'],
      payload: { id: 'qwe', value: newValue }
    });

    expect(state1).toEqual(state2);
    expect(state2.list).toEqual([payload]);
    expect(state2.ids).toEqual([payload.id]);
    expect(state2.byIds).toEqual({ [payload.id]: payload });
  });

  test('delete', () => {
    const mock = createMock();
    const state0 = crudReducer(initialState, {
      type: actionTypes['CREATE'],
      payload: mock
    });

    expect(state0.total).toEqual(1);
    expect(state0.pageNo).toEqual(1);

    const state1 = crudReducer(state0, {
      type: actionTypes['DELETE'],
      payload: { id: mock.id }
    });

    expect(state1.list).toEqual([]);
    expect(state1.ids).toEqual([]);
    expect(state1.byIds).toEqual({});
    expect(state1.byIds[mock.id]).toBeUndefined();

    const state2 = crudReducer(state1, {
      type: actionTypes['DELETE'],
      payload: { id: 'qwe' }
    });

    expect(state1).toEqual({ ...state2, total: 0, pageNo: 1 });
  });

  test('reset', () => {
    const mock = createMock();
    const state0 = crudReducer(initialState, {
      type: actionTypes['CREATE'],
      payload: mock
    });

    expect(state0.ids).toHaveLength(1);
    expect(state0.byIds).toEqual({ [mock.id]: mock });
    expect(state0.list).toEqual([mock]);

    const state1 = crudReducer(state0, {
      type: actionTypes['RESET']
    });

    expect(state1).toEqual(initialState);
  });

  describe('pagination', () => {
    test('basic', () => {
      const mocks1 = createMocks(10);
      const state0 = crudReducer(initialState, {
        type: actionTypes['PAGINATE'],
        payload: mocks1
      });

      expect(state0.list).toEqual(mocks1);
      expect(state0.ids).toEqual(mocks1.map(i => i.id));
      expect(state0.byIds).toEqual(
        mocks1.reduce((r, i) => ({ ...r, [i.id]: i }), {})
      );
      expect(state0.pageNo).toBe(1);
      expect(state0.total).toBe(mocks1.length);

      const mocks2 = createMocks(10);
      const total = mocks2.length * 5;
      const pageNo = 2;
      const pageSize = 10;
      const state1 = crudReducer(state0, {
        type: actionTypes['PAGINATE'],
        payload: {
          total,
          pageNo,
          data: mocks2
        }
      });

      expect(state1.list.slice(0, pageNo * pageSize)).toEqual([
        ...mocks1,
        ...mocks2
      ]);
      expect(state1.ids.slice(0, pageNo * pageSize)).toEqual(
        [...mocks1, ...mocks2].map(i => i.id)
      );
      expect(state1.byIds).toEqual(
        [...mocks1, ...mocks2].reduce((r, i) => ({ ...r, [i.id]: i }), {})
      );
      expect(state1.pageNo).toBe(2);
      expect(state1.total).toBe(total);
    });

    test('pageSize', () => {
      const pageSize = 20;
      const mocks = createMocks(pageSize);
      const total = mocks.length * 5;
      const pageNo = 1;
      const state0 = crudReducer(initialState, {
        type: actionTypes['PAGINATE'],
        payload: {
          total,
          pageNo,
          pageSize,
          data: mocks
        }
      });

      expect(state0.pageSize).toBe(pageSize);
    });

    test('keyGenerator', () => {
      const [initialState, crudReducer] = createCRUDReducer<Schema, 'id'>(
        'id',
        { actionTypes, keyGenerator: index => `idx-${index}` }
      );

      const mocks = createMocks(10);
      const total = mocks.length * 5;
      const pageNo = 1;
      const state0 = crudReducer(initialState, {
        type: actionTypes['PAGINATE'],
        payload: {
          total,
          pageNo,
          data: mocks
        }
      });

      expect(
        state0.ids.slice(mocks.length).every(id => id.startsWith('idx'))
      ).toBeTruthy();
    });

    test('prefill is false', () => {
      const [initialState, crudReducer] = createCRUDReducer<Schema, 'id'>(
        'id',
        { actionTypes, prefill: false }
      );

      const mocks1 = createMocks(10);
      const pageNo = 4;
      const pageSize = 10;
      const state = crudReducer(initialState, {
        type: actionTypes['PAGINATE'],
        payload: { pageNo, data: mocks1, total: pageNo * pageSize * 2 }
      });

      expect(state.pageNo).toBe(1);
      expect(state.total).toBe(mocks1.length);
      expect(state.ids).toHaveLength(mocks1.length);
      expect(state.list).toHaveLength(mocks1.length);
    });

    test('prefill typings', () => {
      const [initialState, crudReducer] = createCRUDReducer<Schema, 'id'>(
        'id',
        { actionTypes, prefill: false }
      );

      const mock = createMock();
      let state = crudReducer(initialState, {
        type: actionTypes['CREATE'],
        payload: mock
      });

      expect(state.total).toBe(1);

      state.list.map(item => {
        state = crudReducer(state, {
          type: actionTypes['UPDATE'],
          payload: { ...item, value: '123123' }
        });

        state = crudReducer(initialState, {
          type: actionTypes['DELETE'],
          payload: { ...item, id: mock.id }
        });
      });

      expect(state).toEqual(initialState);
    });
  });

  describe('params', () => {
    test('normal', () => {
      const params = {
        pageNo: '2',
        pageSize: '20',
        status: '1',
        search: 'search'
      };
      const state0 = crudReducer(initialState, {
        type: actionTypes['PARAMS'],
        payload: qs.parse(qs.stringify(params))
      });

      const { pageNo, pageSize, ...restParams } = params;

      expect(state0.pageNo).toBe(Number(pageNo));
      expect(state0.pageSize).toBe(Number(pageSize));
      expect(state0.params).toEqual(restParams);
    });

    test('pageNo and pageSize should be reset to default is not a number', () => {
      const params = {
        pageNo: '2',
        pageSize: '20'
      };

      const state0 = crudReducer(initialState, {
        type: actionTypes['PARAMS'],
        payload: qs.parse(qs.stringify(params))
      });

      expect(state0.pageNo).toBe(Number(params.pageNo));
      expect(state0.pageSize).toBe(Number(params.pageSize));

      const state1 = crudReducer(state0, {
        type: actionTypes['PARAMS'],
        payload: { test: '' }
      });

      expect(state1.pageNo).toBe(initialState.pageNo);
      expect(state1.pageSize).toBe(initialState.pageSize);
    });

    test('state should be reset if params has change', () => {
      const state0 = crudReducer(initialState, {
        type: actionTypes['LIST'],
        payload: createMocks(10)
      });

      expect(state0.list).toHaveLength(10);

      const state1 = crudReducer(state0, {
        type: actionTypes['PARAMS'],
        payload: qs.parse(qs.stringify({ test: '123' }))
      });

      expect(state1.list).toHaveLength(0);
      expect(state1.pageNo).toBe(1);
      expect(state1.pageSize).toBe(initialState.pageSize);
    });
    test('change pageNo and pageSize will not reset state', () => {
      const total = 5;
      const state0 = crudReducer(initialState, {
        type: actionTypes['LIST'],
        payload: createMocks(total)
      });

      expect(state0.list).toHaveLength(total);

      const state1 = crudReducer(state0, {
        type: actionTypes['PARAMS'],
        payload: qs.parse(qs.stringify({ pageNo: 2 }))
      });

      expect(state1.list).toHaveLength(total);
      expect(state1.pageNo).toBe(2);
      expect(state1.pageSize).toBe(state0.pageSize);

      const state2 = crudReducer(state1, {
        type: actionTypes['PARAMS'],
        payload: qs.parse(qs.stringify({ pageNo: state1.pageNo, pageSize: 20 }))
      });

      expect(state2.list).toHaveLength(total);
      expect(state2.pageNo).toBe(state1.pageNo);
      expect(state2.pageSize).toBe(20);
    });
  });

  test('insert', () => {
    const state = crudReducer(initialState, {
      type: actionTypes['LIST'],
      payload: createMocks(10)
    });

    const mock1 = createMock();
    const state1 = crudReducer(state, {
      type: actionTypes['INSERT'],
      payload: mock1
    });
    expect(state1.ids).toEqual([mock1.id, ...state.ids]);
    expect(state1.list).toEqual([mock1, ...state.list]);
    expect(state1.byIds).toEqual({ ...state.byIds, [mock1.id]: mock1 });

    const mock2 = createMock();
    const state2 = crudReducer(state1, {
      type: actionTypes['INSERT'],
      payload: mock2,
      index: 1
    });
    expect(state2.ids[1]).toEqual(mock2.id);
    expect(state2.list[1]).toEqual(mock2);
    expect(state2.byIds[mock2.id]).toEqual(mock2);

    const mock3 = createMock();
    const state3 = crudReducer(state2, {
      type: actionTypes['INSERT'],
      payload: mock3,
      index: state2.ids.length
    });
    expect(state3.ids).toEqual([...state2.ids, mock3.id]);
    expect(state3.list).toEqual([...state2.list, mock3]);
    expect(state3.byIds).toEqual({ ...state2.byIds, [mock3.id]: mock3 });
  });
});
