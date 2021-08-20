import { CrudState } from './curdReducer';

export interface PaginateState<S extends CrudState<any, any>> {
  ids: S['ids'];
  list: S['list'];
  pageNo: number;
  pageSize: number;
  total: number;
  params: any;
  hasData: boolean;
}

export interface PaginateSelectorOptions {
  prefill?: unknown;
}

export function paginateSelector<S extends CrudState<any, any>>(
  state: S
): PaginateState<S> {
  const { list, ids, pageNo, pageSize, params, total } = state;

  const start = (pageNo - 1) * pageSize;
  const _list = list.slice(start, start + pageSize);
  const _ids = ids.slice(start, start + pageSize);

  const hasData = _list.some(
    item => !item || (typeof item === 'object' && Object.keys(item).length > 1)
  );

  return {
    list: _list,
    ids: _ids,
    pageNo,
    pageSize,
    total,
    params,
    hasData
  };
}
