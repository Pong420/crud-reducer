export type CrudActionMap = {
  [x: string]: CrudActionType;
};

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

export enum CrudActionType {
  List = 'List',
  Create = 'Create',
  Update = 'Update',
  Delete = 'Delete',
  Insert = 'Insert',
  Paginate = 'Paginate',
  Params = 'Params',
  Reset = 'Reset'
}

export type CrudActionCreators<I, K extends Key<I>> = {
  list(payload: I[]): { type: CrudActionType.List; payload: I[] };
  create(payload: I): { type: CrudActionType.Create; payload: I };
  update(payload: UpdatePayload<I, K>): {
    type: CrudActionType.Update;
    payload: UpdatePayload<I, K>;
  };
  insert(
    payload: I,
    index?: number
  ): { type: CrudActionType.Insert; payload: I; index?: number };
  delete(payload: { [T in K]: string }): {
    type: CrudActionType.Delete;
    payload: { [T in K]: string };
  };
  paginate(payload: PaginatePayload<I>): {
    type: CrudActionType.Paginate;
    payload: PaginatePayload<I>;
  };
  params(payload: Record<string, any>): {
    type: CrudActionType.Params;
    payload: Record<string, any>;
  };
  reset(): { type: CrudActionType.Reset };
};

export type CrudActions<I, K extends Key<I>> = ReturnType<
  CrudActionCreators<I, K>[keyof CrudActionCreators<I, K>]
>;

type RemoveType<C extends ActionCreators> = {
  [K in keyof C]: (
    ...args: Parameters<C[K]>
  ) => Omit<ReturnType<C[K]>, 'type'> & { type: string };
};

export function createCrudActionCreator<I, K extends Key<I>>(prefix?: string) {
  const map = { ...CrudActionType } as CrudActionMap;

  if (prefix) {
    for (const _key in map) {
      const key = _key as CrudActionType;
      const prefixed = `${prefix}-${map[key]}`;
      map[prefixed] = key;
    }
  }

  const creators: RemoveType<CrudActionCreators<I, K>> = {
    list(payload: I[]) {
      return { type: map[CrudActionType.List], payload };
    },
    create(payload: I) {
      return { type: map[CrudActionType.Create], payload };
    },
    insert(payload: I, index?: number) {
      return { type: map[CrudActionType.Insert], payload, index };
    },
    update(payload: UpdatePayload<I, K>) {
      return { type: map[CrudActionType.Update], payload };
    },
    delete(payload: { [T in K]: string }) {
      return { type: map[CrudActionType.Delete], payload };
    },
    paginate(payload: PaginatePayload<I>) {
      return { type: map[CrudActionType.Paginate], payload };
    },
    params(payload: Record<string, any>) {
      return { type: map[CrudActionType.Params], payload };
    },
    reset() {
      return { type: map[CrudActionType.Reset] };
    }
  };

  return [map, creators] as const;
}
