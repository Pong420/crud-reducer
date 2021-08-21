import { createCrudActionCreator } from '../src/curdAction';
import { CrudReducer, CrudState, createCrudReducer } from '../src/curdReducer';
import { paginateSelector } from '../src/crudSelector';

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

describe('selector', () => {
  let initialState: CrudState<Schema>;
  let crudReducer: CrudReducer<Schema, 'id'>;
  const actionCreators = createCrudActionCreator<Schema, 'id'>();

  beforeEach(() => {
    [initialState, crudReducer] = createCrudReducer<Schema, 'id'>('id');
  });

  describe('paginateSelector', () => {
    test('normal', () => {
      const pageSize = 10;
      const total = pageSize * 10;
      const mocks0 = createMocks(pageSize);

      const state0 = crudReducer(
        initialState,
        actionCreators.paginate({
          data: mocks0,
          pageNo: 1,
          total
        })
      );

      expect(paginateSelector(state0)).toEqual({
        list: mocks0,
        ids: mocks0.map(i => i.id),
        hasData: true,
        pageNo: 1,
        pageSize,
        params: {},
        total
      });

      const nextPage = 2;

      const state1 = crudReducer(
        state0,
        actionCreators.params({ pageNo: nextPage })
      );

      expect(paginateSelector(state1)).toEqual({
        list: state0.list.slice(pageSize, pageSize * nextPage),
        ids: state0.ids.slice(pageSize, pageSize * nextPage),
        hasData: false,
        pageNo: 2,
        pageSize,
        params: {},
        total
      });
    });
  });
});
