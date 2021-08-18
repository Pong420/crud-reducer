export type CrudActionType = keyof typeof CrudActionType;

export type CrudActionMap = {
  [x: string]: CrudActionType;
} & {
  [K in CrudActionType]: string;
};

export type FilterFlags<Base, Condition> = {
  [Key in keyof Base]: Base[Key] extends Condition ? Key : never;
};

export type AllowedNames<Base, Condition> = FilterFlags<
  Base,
  Condition
>[keyof Base];

export type Key<I> = AllowedNames<I, string>;

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

export const CrudActionType = {
  List: 'List',
  Create: 'Create',
  Update: 'Update',
  Delete: 'Delete',
  Insert: 'Insert',
  Paginate: 'Paginate',
  Params: 'Params',
  Reset: 'Reset'
};

export class CrudActions<I, K extends Key<I>> {
  map = CrudActionType as CrudActionMap;

  constructor(prefix?: string) {
    if (prefix) {
      const { map } = this;
      for (const _key in map) {
        const key = _key as CrudActionType;
        const prefixed = `${prefix}_${map[key]}`;
        map[key] = prefixed;
        map[prefixed] = key;
      }
    }
  }

  get<T extends CrudActionType>(type: T) {
    return this.map[this.map[type]] as T;
  }

  list(payload: I[]) {
    return { type: this.get('List'), payload };
  }
  create(payload: I) {
    return { type: this.get('Create'), payload };
  }
  insert(payload: I, index?: number) {
    return { type: this.get('Insert'), payload, index };
  }
  update(payload: UpdatePayload<I, K>) {
    return { type: this.get('Update'), payload };
  }
  delete(payload: { [T in K]: string }) {
    return { type: this.get('Delete'), payload };
  }
  paginate(payload: PaginatePayload<I>) {
    return { type: this.get('Paginate'), payload };
  }
  params(payload: Record<string, any>) {
    return { type: this.get('Params'), payload };
  }
  reset() {
    return { type: this.get('Reset') };
  }
}
