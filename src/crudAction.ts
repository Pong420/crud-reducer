/* eslint-disable @typescript-eslint/ban-types */

import { UnionActions } from './useActions';

// https://medium.com/dailyjs/typescript-create-a-condition-based-subset-types-9d902cea5b8c
export type FilterFlags<Base, Condition> = {
  [Key in keyof Base]: Base[Key] extends Condition ? Key : never;
};

export type AllowedNames<Base, Condition> = FilterFlags<
  Base,
  Condition
>[keyof Base];

export type Key<I> = AllowedNames<I, string>;

export interface AnyAction {
  type: string;
  [extraProps: string]: any;
}

export interface ActionCreators {
  [k: string]: (...args: any[]) => AnyAction;
}

export type PaginatePayload<I> =
  | I[]
  | {
      data: I[];
      total: number;
      pageNo: number;
      pageSize?: number;
    };

export type BaseCRUDActionType =
  | 'LIST'
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'PAGINATE'
  | 'PARAMS'
  | 'RESET';

export type CRUDActionTypes<Type extends string = any> = Record<
  BaseCRUDActionType,
  Type
>;

export type List<Type extends string, I> = {
  type: Type;
  payload: I[];
};

export type Create<Type extends string, I> = {
  type: Type;
  payload: I;
};

export interface Update<Type extends string, I, K extends Key<I>> {
  type: Type;
  payload: Partial<I> & { [T in K]: string };
}

export interface Delete<Type extends string, I, K extends Key<I>> {
  type: Type;
  payload: { [T in K]: string };
}

export interface Paginate<Type extends string, I> {
  type: Type;
  payload: PaginatePayload<I>;
}

export interface Params<Type extends string> {
  type: Type;
  payload: Record<string, any>;
}

export interface Reset<Type extends string> {
  type: Type;
}

export type CRUDActionCreators<
  I,
  K extends Key<I>,
  M extends CRUDActionTypes = CRUDActionTypes
> = {
  list: (payload: I[]) => List<M['LIST'], I>;
  create: (payload: I) => Create<M['CREATE'], I>;
  update: (
    payload: Update<string, I, K>['payload']
  ) => Update<M['UPDATE'], I, K>;
  delete: (payload: { [T in K]: string }) => Delete<M['DELETE'], I, K>;
  paginate: (payload: PaginatePayload<I>) => Paginate<M['PAGINATE'], I>;
  params: (payload: Record<string, any>) => Params<M['PARAMS']>;
  reset: () => Reset<M['RESET']>;
};

export type CRUDActions<
  I,
  K extends Key<I>,
  M extends CRUDActionTypes = CRUDActionTypes
> = UnionActions<CRUDActionCreators<I, K, M>>;

export type ExtractAction<
  T1 extends AnyAction,
  T2 extends T1['type']
> = T1 extends { type: T2 } ? T1 : never;

export function isAction<
  I,
  K extends Key<I>,
  M extends CRUDActionTypes = CRUDActionTypes,
  BaseType extends keyof M = keyof M
>(
  map: M,
  action: CRUDActions<I, K, M>,
  type: BaseType
): action is ExtractAction<CRUDActions<I, K, M>, M[BaseType]> {
  return action.type === map[type];
}

export const baseActionTypes = {
  LIST: 'LIST',
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  PAGINATE: 'PAGINATE',
  PARAMS: 'PARAMS',
  RESET: 'RESET'
} as const;

export function getCRUDActionsCreator<I, K extends Key<I>>() {
  // prettier-ignore
  function create(): [CRUDActionCreators<I, K, typeof baseActionTypes>, typeof baseActionTypes]
  // prettier-ignore
  function create<M extends CRUDActionTypes = CRUDActionTypes>(actionTypes: Partial<M>): [CRUDActionCreators<I, K, M>, M]
  // prettier-ignore
  function create<M extends CRUDActionTypes = CRUDActionTypes>(actionTypes = baseActionTypes as Partial<M>) {
   const creators: CRUDActionCreators<I, K, M> = {
     list: payload => ({ type: actionTypes['LIST'], payload }),
     create: payload => ({ type: actionTypes['CREATE'], payload }),
     update: payload => ({ type: actionTypes['UPDATE'], payload }),
     delete: payload => ({ type: actionTypes['DELETE'], payload }),
     paginate: payload => ({ type: actionTypes['PAGINATE'], payload }),
     params: payload => ({ type: actionTypes['PARAMS'], payload }),
     reset: () => ({ type: actionTypes['RESET'] })
   };
   return [creators, actionTypes] as const;
 }
  return create;
}
