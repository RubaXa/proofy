import React from 'react';
import { TodoTextInput } from '../TodoTextInput';
import { TodoActions } from 'app/actions/todos';
import { useXEvents } from '../../../xfeature';

export namespace Header {
  export interface Props {
    addTodo: typeof TodoActions.addTodo;
  }
}

export const Header = ({ addTodo }: Header.Props): JSX.Element => {
  const xevents = useXEvents();
  const handleSave = React.useCallback(
    (text: string) => {
      if (text.length) {
        xevents.todoItem.edit({act: 'add'});
        addTodo({ text });
      }
    },
    [addTodo]
  );

  return (
    <header>
      <h1>Todos</h1>
      <TodoTextInput value="" newTodo onSave={handleSave} placeholder="What needs to be done?" />
    </header>
  );
};
