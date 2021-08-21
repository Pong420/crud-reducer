import { createCrudActionCreator } from '../src/crudAction';
import { createCrudReducer } from '../src/crudReducer';
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

const actionCreators = createCrudActionCreator<Schema, 'id'>();
const prefixedActionCreators = createCrudActionCreator<Schema, 'id'>('Schema');

const testOptions = [
  ['default', actionCreators],
  ['prefixed ', prefixedActionCreators]
] as const;

describe.each(testOptions)('crud reducer - %s', (_, actionCreators) => {
  const [initialState, crudReducer] = createCrudReducer<Schema, 'id'>('id', {
    actionCreators
  });

  test('default', () => {
    const state: any = undefined;
    const action: any = { type: 'action' };
    expect(crudReducer(state, action)).toEqual(initialState);
  });

  test('list', () => {
    function list(initial: typeof state, payload: Schema[]) {
      const state = crudReducer(initial, actionCreators.list(payload));
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
      const state = crudReducer(initial, actionCreators.create(payload));
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
    const state0 = crudReducer(initialState, actionCreators.create(mock));

    const newValue = '123';
    const payload = { id: mock.id, value: newValue };
    const state1 = crudReducer(state0, actionCreators.update(payload));

    // should not be ignored
    const state2 = crudReducer(
      state1,
      actionCreators.update({ id: 'qwe', value: newValue })
    );

    expect(state1).toEqual(state2);
    expect(state2.list).toEqual([payload]);
    expect(state2.ids).toEqual([payload.id]);
    expect(state2.byIds).toEqual({ [payload.id]: payload });
  });

  test('delete', () => {
    const mock = createMock();
    const state0 = crudReducer(initialState, actionCreators.create(mock));

    expect(state0.total).toEqual(1);
    expect(state0.pageNo).toEqual(1);

    const state1 = crudReducer(state0, actionCreators.delete({ id: mock.id }));

    expect(state1.list).toEqual([]);
    expect(state1.ids).toEqual([]);
    expect(state1.byIds).toEqual({});
    expect(state1.byIds[mock.id]).toBeUndefined();

    const state2 = crudReducer(state1, actionCreators.delete({ id: 'qwe' }));

    expect(state1).toEqual({ ...state2, total: 0, pageNo: 1 });
  });

  test('reset', () => {
    const mock = createMock();
    const state0 = crudReducer(initialState, actionCreators.create(mock));

    expect(state0.ids).toHaveLength(1);
    expect(state0.byIds).toEqual({ [mock.id]: mock });
    expect(state0.list).toEqual([mock]);

    const state1 = crudReducer(state0, actionCreators.reset());

    expect(state1).toEqual(initialState);
  });

  describe('pagination', () => {
    test('basic', () => {
      const mocks1 = createMocks(10);
      const state0 = crudReducer(initialState, actionCreators.paginate(mocks1));

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
      const state1 = crudReducer(
        state0,
        actionCreators.paginate({
          total,
          pageNo,
          data: mocks2
        })
      );

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
      const state0 = crudReducer(
        initialState,
        actionCreators.paginate({
          total,
          pageNo,
          pageSize,
          data: mocks
        })
      );

      expect(state0.pageSize).toBe(pageSize);
    });

    test('idGenerator', () => {
      const [initialState, crudReducer] = createCrudReducer<Schema, 'id'>(
        'id',
        { actionCreators, idGenerator: index => `idx-${index}` }
      );

      const mocks = createMocks(10);
      const total = mocks.length * 5;
      const pageNo = 1;
      const state0 = crudReducer(
        initialState,
        actionCreators.paginate({
          total,
          pageNo,
          data: mocks
        })
      );

      expect(
        state0.ids.slice(mocks.length).every(id => id.startsWith('idx'))
      ).toBeTruthy();
    });

    test('prefill is false', () => {
      const [initialState, crudReducer] = createCrudReducer<Schema, 'id'>(
        'id',
        { actionCreators, prefill: false }
      );

      const mocks1 = createMocks(10);
      const pageNo = 4;
      const pageSize = 10;
      const state = crudReducer(
        initialState,
        actionCreators.paginate({
          pageNo,
          data: mocks1,
          total: pageNo * pageSize * 2
        })
      );

      expect(state.pageNo).toBe(1);
      expect(state.total).toBe(mocks1.length);
      expect(state.ids).toHaveLength(mocks1.length);
      expect(state.list).toHaveLength(mocks1.length);
    });

    test('prefill typings', () => {
      const [initialState, crudReducer] = createCrudReducer<Schema, 'id'>(
        'id',
        { actionCreators, prefill: false }
      );

      const mock = createMock();
      let state = crudReducer(initialState, actionCreators.create(mock));

      expect(state.total).toBe(1);

      state.list.map(item => {
        state = crudReducer(
          state,
          actionCreators.update({ ...item, value: '123123' })
        );

        state = crudReducer(
          initialState,
          actionCreators.delete({ ...item, id: mock.id })
        );

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
        const state0 = crudReducer(
          initialState,
          actionCreators.params(qs.parse(qs.stringify(params)))
        );

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

        const state0 = crudReducer(
          initialState,
          actionCreators.params(qs.parse(qs.stringify(params)))
        );

        expect(state0.pageNo).toBe(Number(params.pageNo));
        expect(state0.pageSize).toBe(Number(params.pageSize));

        const state1 = crudReducer(state0, actionCreators.params({ test: '' }));

        expect(state1.pageNo).toBe(initialState.pageNo);
        expect(state1.pageSize).toBe(initialState.pageSize);
      });

      test('state should be reset if params has change', () => {
        const state0 = crudReducer(
          initialState,
          actionCreators.list(createMocks(10))
        );

        expect(state0.list).toHaveLength(10);

        const state1 = crudReducer(
          state0,
          actionCreators.params(qs.parse(qs.stringify({ test: '123' })))
        );

        expect(state1.list).toHaveLength(0);
        expect(state1.pageNo).toBe(1);
        expect(state1.pageSize).toBe(initialState.pageSize);
      });
      test('change pageNo and pageSize will not reset state', () => {
        const total = 5;
        const state0 = crudReducer(
          initialState,
          actionCreators.list(createMocks(total))
        );

        expect(state0.list).toHaveLength(total);

        const state1 = crudReducer(
          state0,
          actionCreators.params(qs.parse(qs.stringify({ pageNo: 2 })))
        );

        expect(state1.list).toHaveLength(total);
        expect(state1.pageNo).toBe(2);
        expect(state1.pageSize).toBe(state0.pageSize);

        const state2 = crudReducer(
          state1,
          actionCreators.params(
            qs.parse(qs.stringify({ pageNo: state1.pageNo, pageSize: 20 }))
          )
        );

        expect(state2.list).toHaveLength(total);
        expect(state2.pageNo).toBe(state1.pageNo);
        expect(state2.pageSize).toBe(20);
      });
    });

    test('insert', () => {
      const state = crudReducer(
        initialState,
        actionCreators.list(createMocks(10))
      );

      const mock1 = createMock();
      const state1 = crudReducer(state, actionCreators.insert(mock1));
      expect(state1.ids).toEqual([mock1.id, ...state.ids]);
      expect(state1.list).toEqual([mock1, ...state.list]);
      expect(state1.byIds).toEqual({ ...state.byIds, [mock1.id]: mock1 });

      const mock2 = createMock();
      const state2 = crudReducer(state1, actionCreators.insert(mock2, 1));
      expect(state2.ids[1]).toEqual(mock2.id);
      expect(state2.list[1]).toEqual(mock2);
      expect(state2.byIds[mock2.id]).toEqual(mock2);

      const mock3 = createMock();
      const state3 = crudReducer(
        state2,
        actionCreators.insert(mock3, state2.ids.length)
      );
      expect(state3.ids).toEqual([...state2.ids, mock3.id]);
      expect(state3.list).toEqual([...state2.list, mock3]);
      expect(state3.byIds).toEqual({ ...state2.byIds, [mock3.id]: mock3 });
    });

    test('pageNo update correctly after create/insert/delete', () => {
      const [initialState, crudReducer] = createCrudReducer<Schema, 'id'>(
        'id',
        {
          actionCreators
        }
      );

      let state = crudReducer(
        initialState,
        actionCreators.paginate(createMocks(initialState.pageSize))
      );
      expect(state.list.length).toBe(initialState.pageSize);

      let mock = createMock();
      state = crudReducer(state, actionCreators.create(mock));
      expect(state.pageNo).toBe(2);

      state = crudReducer(state, actionCreators.delete(mock));
      expect(state.pageNo).toBe(1);

      mock = createMock();
      state = crudReducer(
        state,
        actionCreators.insert(mock, initialState.pageSize)
      );
      expect(state.list[initialState.pageSize]).toEqual(mock);
      expect(state.pageNo).toBe(2);

      mock = createMock();
      state = crudReducer(state, actionCreators.insert(mock, 1));

      expect(state.list[1]).toEqual(mock);
      expect(state.pageNo).toBe(1);
    });
  });
});
