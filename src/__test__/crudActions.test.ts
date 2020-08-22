import { createCRUDActionsCreators } from '../crudActions';

describe('actions', () => {
  test('defined', () => {
    const payload = { id: '123' };
    const actions = createCRUDActionsCreators<{ id: string }, 'id'>();
    expect(actions).toBeDefined();
    expect(actions.list([])).toEqual({ type: 'LIST', payload: [] });
    expect(actions.create(payload)).toEqual({ type: 'CREATE', payload });
    expect(actions.update(payload)).toEqual({ type: 'UPDATE', payload });
    expect(actions.delete(payload)).toEqual({ type: 'DELETE', payload });
    expect(actions.paginate([])).toEqual({ type: 'PAGINATE', payload: [] });
    expect(actions.params(payload)).toEqual({ type: 'PARAMS', payload });
    expect(actions.reset()).toEqual({ type: 'RESET' });
  });
});
