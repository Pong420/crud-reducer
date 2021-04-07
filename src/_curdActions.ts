// https://medium.com/dailyjs/typescript-create-a-condition-based-subset-types-9d902cea5b8c
export type FilterFlags<Base, Condition> = {
  [Key in keyof Base]: Base[Key] extends Condition ? Key : never;
};

export type AllowedNames<Base, Condition> = FilterFlags<
  Base,
  Condition
>[keyof Base];

export type Key<I> = AllowedNames<I, string>;
export type ValueOf<T> = T[keyof T];

export interface AnyAction {
  type: string;
  [extraProps: string]: any;
}

export type BasicCRUDActionType =
  | 'LIST'
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'INSERT'
  | 'PAGINATE'
  | 'PARAMS'
  | 'RESET';

export type CRUDActionType<Prefix extends string = string> =
  | BasicCRUDActionType
  | `${Prefix}_${BasicCRUDActionType}`;

export type UpdatePayload<I, K extends Key<I>> = Partial<I> &
  { [T in K]: string };

export type PaginatePayload<I> =
  | I[]
  | {
      data: I[];
      total: number;
      pageNo: number;
      pageSize?: number;
    };

export type ExtractType<
  F extends string,
  T extends BasicCRUDActionType
> = F extends `${infer P}_${T}` ? `${P}_${T}` : T;

export type List<T extends CRUDActionType, I> = {
  type: ExtractType<T, 'LIST'>;
  payload: I[];
};

export type Create<T extends CRUDActionType, I> = {
  type: ExtractType<T, 'CREATE'>;
  payload: I;
};

export type Insert<T extends CRUDActionType, I> = {
  type: ExtractType<T, 'INSERT'>;
  payload: I;
  index?: number;
};

export interface Update<T extends CRUDActionType, I, K extends Key<I>> {
  type: ExtractType<T, 'UPDATE'>;
  payload: UpdatePayload<I, K>;
}

export interface Delete<T extends CRUDActionType, I, K extends Key<I>> {
  type: ExtractType<T, 'DELETE'>;
  payload: { [T in K]: string };
}

export interface Paginate<T extends CRUDActionType, I> {
  type: ExtractType<T, 'PAGINATE'>;
  payload: PaginatePayload<I>;
}

export interface Params<T extends CRUDActionType> {
  type: ExtractType<T, 'PARAMS'>;
  payload: Record<string, any>;
}

export interface Reset<T extends CRUDActionType> {
  type: ExtractType<T, 'RESET'>;
}

export type CRUDActionCreators<
  I,
  K extends Key<I>,
  T extends CRUDActionType
> = {
  list: (payload: I[]) => List<T, I>;
  create: (payload: I) => Create<T, I>;
  insert: (payload: I, index?: number) => Insert<T, I>;
  update: (payload: Update<T, I, K>['payload']) => Update<T, I, K>;
  delete: (payload: { [T in K]: string }) => Delete<T, I, K>;
  paginate: (payload: PaginatePayload<I>) => Paginate<T, I>;
  params: (payload: Record<string, any>) => Params<T>;
  reset: () => Reset<T>;
};

export type CRUDActions<I, K extends Key<I>, P extends string> = ReturnType<
  ValueOf<CRUDActionCreators<I, K, CRUDActionType<P>>>
>;

export const createType = <T extends BasicCRUDActionType>(
  type: T,
  prefix?: string
) => (prefix ? (`${prefix}_${type}` as `${string}_${T}`) : type);

export function createCRUDActionsCreators<I, K extends Key<I>>(
  prefix?: string
) {
  const getType = <T extends BasicCRUDActionType>(type: T) =>
    createType(type, prefix);

  const creators: CRUDActionCreators<I, K, CRUDActionType> = {
    list: payload => ({ type: getType('LIST'), payload }),
    create: payload => ({ type: getType('CREATE'), payload }),
    update: payload => ({ type: getType('UPDATE'), payload }),
    delete: payload => ({ type: getType('DELETE'), payload }),
    paginate: payload => ({ type: getType('PAGINATE'), payload }),
    params: payload => ({ type: getType('PARAMS'), payload }),
    reset: () => ({ type: getType('RESET') }),
    insert: (payload, index?: number) => ({
      type: getType('INSERT'),
      payload,
      index
    })
  };

  return creators;
}
