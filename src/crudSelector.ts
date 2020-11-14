import { CRUDState, equals } from './crudReducer';

export interface PaginateState<S extends CRUDState<unknown, any>> {
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

export function paginateSelector<S extends CRUDState<any, any>>(
  { list, ids, pageNo, pageSize, params, total }: S,
  { prefill = null }: PaginateSelectorOptions = {}
): PaginateState<S> {
  const start = (pageNo - 1) * pageSize;
  const _list = list.slice(start, start + pageSize);
  const _ids = ids.slice(start, start + pageSize);

  let hasData = !!_list.length;
  for (const item of _list) {
    if (equals(item, prefill)) {
      hasData = false;
      break;
    }
  }

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
