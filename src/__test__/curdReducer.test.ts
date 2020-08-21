import { CRUDReducer, CRUDState, createCRUDReducer } from '../crudReducer';
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

describe('crud reducer', () => {
  let initialState: CRUDState<Schema>;
  let crudReducer: CRUDReducer<Schema, 'id'>;

  beforeEach(() => {
    [initialState, crudReducer] = createCRUDReducer<Schema, 'id'>('id');
  });

  test('default', () => {
    const state: any = undefined;
    const action: any = { type: 'action' };
    expect(crudReducer(state, action)).toEqual(initialState);
  });

  test('list', () => {
    function list(initial: typeof state, payload: Schema[]) {
      const state = crudReducer(initial, {
        type: 'LIST',
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
        type: 'CREATE',
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
      type: 'CREATE',
      payload: mock
    });

    const newValue = '123';
    const payload = { id: mock.id, value: newValue };
    const state1 = crudReducer(state0, {
      type: 'UPDATE',
      payload
    });

    // should not be ignored
    const state2 = crudReducer(state1, {
      type: 'UPDATE',
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
      type: 'CREATE',
      payload: mock
    });

    const state1 = crudReducer(state0, {
      type: 'DELETE',
      payload: { id: mock.id }
    });

    expect(state1.list).toEqual([]);
    expect(state1.ids).toEqual([]);
    expect(state1.byIds).toEqual({});

    // should not be ignored
    const state2 = crudReducer(state1, {
      type: 'DELETE',
      payload: { id: 'qwe' }
    });

    expect(state1).toEqual(state2);
  });

  test('reset', () => {
    const mock = createMock();
    const state0 = crudReducer(initialState, {
      type: 'CREATE',
      payload: mock
    });

    const state1 = crudReducer(state0, {
      type: 'RESET'
    });

    expect(state1).toEqual(initialState);
  });

  describe('pagination', () => {
    test('normal', () => {
      const mocks1 = createMocks(10);
      const state0 = crudReducer(initialState, {
        type: 'PAGINATE',
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
        type: 'PAGINATE',
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

    test.each([true, false])('prefill is %s', prefill => {
      [initialState, crudReducer] = createCRUDReducer<Schema, 'id'>('id', {
        prefill
      });

      const mocks1 = createMocks(10);
      const pageNo = 4;
      const pageSize = 10;
      const total = pageNo * pageSize * 2;
      const state = crudReducer(initialState, {
        type: 'PAGINATE',
        payload: { pageNo, data: mocks1, total: pageNo * pageSize * 2 }
      });

      if (prefill) {
        expect(state.total).toBe(total);
        expect(state.ids.length).toBe(total);
        expect(state.list.length).toBe(total);

        expect(
          state.ids.slice(0, (pageNo - 1) * pageSize).every(i => i === null)
        );
        expect(
          state.list
            .slice(0, (pageNo - 1) * pageSize)
            .every(i => Object.keys(i).length === 0)
        );
      } else {
        expect(state.pageNo).toBe(1);
        expect(state.total).toBe(0);
        expect(state.ids.length).toBe(mocks1.length);
        expect(state.list.length).toBe(mocks1.length);
      }
    });
  });

  test('params', () => {
    const params = {
      pageNo: 2,
      pageSize: 20,
      status: 1,
      search: 'search'
    };
    const state0 = crudReducer(initialState, {
      type: 'PARAMS',
      payload: qs.parse(qs.stringify(params))
    });

    const { pageNo, pageSize, ...restParams } = params;

    expect(state0.pageNo).toBe(pageNo);
    expect(state0.pageSize).toBe(pageSize);
    expect(Object.keys(state0.params)).toEqual(Object.keys(restParams));
  });
});
