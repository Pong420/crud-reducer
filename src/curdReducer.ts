import {
  Key,
  CrudActions,
  CrudActionCreators,
  createCrudActionCreator
} from './curdAction';
import {
  parsePaginatePayload,
  createPlaceholder,
  defaultIdGenerator,
  createInsert,
  removeFromArray,
  equals
} from './utils';

export interface CrudState<I, Prefill extends boolean = true> {
  ids: string[];
  byIds: Record<string, I>;
  list: Prefill extends true ? (I | Partial<I>)[] : I[];
  pageNo: number;
  pageSize: number;
  total: number;
  params: Record<string, any>;
}

export type CrudReducer<I, K extends Key<I>, Prefill extends boolean = true> = (
  state: CrudState<I, Prefill>,
  action: CrudActions<I, K>
) => CrudState<I, Prefill>;

export interface CreateCrudReducerOptions<
  I,
  K extends Key<I>,
  Prefill extends boolean = true
> {
  prefill?: Prefill;
  actionCreators?: CrudActionCreators<I, K>;
  idGenerator?: (index: number) => string;
  defaultState?: Partial<CrudState<I, Prefill>>;
}

// prettier-ignore
export interface CreateCrudReducer {
  <I, K extends Key<I>>(key: K, options: CreateCrudReducerOptions<I, K, false> & { prefill: false }): [CrudState<I, false>, CrudReducer<I, K, false>];
  <I, K extends Key<I>>(key: K, options?: CreateCrudReducerOptions<I, K, true>): [CrudState<I, true>, CrudReducer<I, K, true>];
  <I, K extends Key<I>>(key: K, options?: CreateCrudReducerOptions<I, K, boolean>): [CrudState<I, boolean>, CrudReducer<I, K, boolean>];
}

export const DefaultState: CrudState<any, any> = {
  byIds: {},
  ids: [],
  list: [],
  pageNo: 1,
  pageSize: 10,
  total: 0,
  params: {}
};

export const createCrudReducer: CreateCrudReducer = <
  I,
  K extends Key<I>,
  Prefill extends boolean = true
>(
  key: K,
  options?: CreateCrudReducerOptions<I, K, Prefill>
) => {
  const {
    prefill = true,
    idGenerator = defaultIdGenerator,
    actionCreators = createCrudActionCreator<I, K>()
  } = options || {};

  const defaultState = {
    ...DefaultState,
    ...options?.defaultState
  } as CrudState<I, boolean>;

  const reducer: CrudReducer<I, K, boolean> = (
    state = defaultState,
    action
  ) => {
    switch (action.type) {
      case 'Paginate': {
        const payload = parsePaginatePayload(action.payload);
        const { data, pageNo, total, pageSize = state.pageSize } = payload;

        if (prefill === false) {
          return reducer(state, actionCreators.list(data));
        }

        const start = (pageNo - 1) * pageSize;
        const insert = createInsert(start, start + pageSize);

        const { list, ids, byIds } = reducer(
          defaultState,
          actionCreators.list(data)
        );

        const length = total - state.ids.length;
        const placeholder = createPlaceholder<I, K>(key, length, idGenerator);

        return {
          ...state,
          total,
          pageNo,
          pageSize,
          byIds: {
            ...state.byIds,
            ...byIds
          },
          ids: insert([...state.ids, ...placeholder.ids], ids),
          list: insert([...state.list, ...placeholder.list], list)
        };
      }

      case 'List': {
        return action.payload.reduce(
          (state, payload) => reducer(state, actionCreators.create(payload)),
          { ...state, list: [], ids: [], byIds: {} } as CrudState<I, boolean>
        );
      }

      case 'Create': {
        const id = action.payload[key];
        const total = state.total + 1;

        // naviagte to the page no of the new item
        const pageNo = Math.ceil(total / state.pageSize);

        return {
          ...state,
          pageNo,
          total,
          byIds: { ...state.byIds, [id]: action.payload },
          list: [...state.list, action.payload],
          ids: [...state.ids, id]
        };
      }

      case 'Insert': {
        const { payload, index = 0 } = action;
        const insert = createInsert(index, index);
        const id = (action.payload[key] as unknown) as string;
        const total = state.total + 1;

        // naviagte to the page no of the new item
        const pageNo = Math.ceil((index + 1) / state.pageSize);

        return {
          ...state,
          total,
          pageNo,
          ids: insert(state.ids, [id]),
          list: insert(state.list, [payload]),
          byIds: { ...state.byIds, [id]: payload }
        };
      }

      case 'Update': {
        const id = action.payload[key];
        const updated = { ...state.byIds[id], ...action.payload };
        const index = state.ids.indexOf(id);
        return index === -1
          ? state
          : {
              ...state,
              byIds: { ...state.byIds, [id]: updated },
              list: [
                ...state.list.slice(0, index),
                updated,
                ...state.list.slice(index + 1)
              ]
            };
      }

      case 'Delete': {
        const id = action.payload[key];
        const index = state.ids.indexOf(id);
        const { [id]: deleted, ...byIds } = { ...state.byIds };

        const total = Math.max(0, state.total - 1);

        // naviagte to previous page if current is not exists
        const totalPage = Math.ceil(total / state.pageSize) || 1;
        const pageNo = Math.min(totalPage, state.pageNo);

        return {
          ...state,
          byIds,
          pageNo,
          total,
          ids: removeFromArray(state.ids, index),
          list: removeFromArray(state.list, index)
        };
      }

      case 'Params': {
        const { pageNo, pageSize, ...params } = action.payload;
        const toNum = (value: unknown, num: number) =>
          typeof value === 'undefined' || isNaN(Number(value))
            ? num
            : Number(value);

        const newPageNo = toNum(pageNo, defaultState.pageNo);
        const newPageSize = toNum(pageSize, defaultState.pageSize);
        const hasChanged = !equals(state.params, params);

        return hasChanged
          ? {
              ...defaultState,
              pageNo: newPageNo,
              pageSize: newPageSize,
              params
            }
          : { ...state, pageNo: newPageNo, pageSize: newPageSize };
      }

      case 'Reset':
        return defaultState;
    }

    return state;
  };

  return [defaultState, reducer];
};
