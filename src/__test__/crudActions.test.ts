import { getCRUDActionsCreator } from '../crudAction';

describe('actions', () => {
  test('defined', () => {
    const payload = { id: '123' };
    const [actions] = getCRUDActionsCreator<{ id: string }, 'id'>()();

    expect(actions).toBeDefined();
    expect(actions.list([])).toEqual({ type: 'LIST', payload: [] });
    expect(actions.create(payload)).toEqual({ type: 'CREATE', payload });
    expect(actions.update(payload)).toEqual({ type: 'UPDATE', payload });
    expect(actions.delete(payload)).toEqual({ type: 'DELETE', payload });
    expect(actions.paginate([])).toEqual({ type: 'PAGINATE', payload: [] });
    expect(actions.params(payload)).toEqual({ type: 'PARAMS', payload });
    expect(actions.reset()).toEqual({ type: 'RESET' });
  });

  test('custom action types', () => {
    const payload = { id: '123' };
    const [actions] = getCRUDActionsCreator<{ id: string }, 'id'>()({
      LIST: 'LIST_TODO',
      CREATE: 'CREATE_TODO',
      UPDATE: 'UPDATE_TODO',
      DELETE: 'DELETE_TODO',
      PAGINATE: 'PAGINATE_TODO',
      PARAMS: 'PARAMS_TODO',
      RESET: 'RESET_TODO'
    });

    expect(actions).toBeDefined();
    expect(actions.list([])).toEqual({ type: 'LIST_TODO', payload: [] });
    expect(actions.create(payload)).toEqual({ type: 'CREATE_TODO', payload });
    expect(actions.update(payload)).toEqual({ type: 'UPDATE_TODO', payload });
    expect(actions.delete(payload)).toEqual({ type: 'DELETE_TODO', payload });
    expect(actions.paginate([])).toEqual({
      type: 'PAGINATE_TODO',
      payload: []
    });
    expect(actions.params(payload)).toEqual({ type: 'PARAMS_TODO', payload });
    expect(actions.reset()).toEqual({ type: 'RESET_TODO' });

    // --------------------------------------------------------------------------------------------------

    const [partial] = getCRUDActionsCreator<{ id: string }, 'id'>()({
      LIST: 'LIST_TODO'
    });

    expect(partial).toBeDefined();
    expect(partial.list([])).toEqual({ type: 'LIST_TODO', payload: [] });
    expect(partial.create(payload)).toEqual({ type: undefined, payload });

    // --------------------------------------------------------------------------------------------------

    enum TodoActionTypes {
      LIST = 'LIST_TODO'
    }

    const [enumActions] = getCRUDActionsCreator<{ id: string }, 'id'>()(
      TodoActionTypes
    );

    expect(enumActions).toBeDefined();
    expect(enumActions.list([])).toEqual({ type: 'LIST_TODO', payload: [] });
  });
});
